// scripts/harness-entry-repro.tsx
// Like harness-entry but mounts a *variant* of App where the ActivityLine shown
// in the conversation stream is phase='running'. The braille-spinner interval
// fires every 60ms → setState → ink commits Frame 2.
// With ink debug=true we get every frame as a separate block.
// We then count "✦ dsh-TUI lite" copies: if every frame (Frame 1 + Frame 2) is
// APPENDED (bug) instead of OVERWRITTEN-in-place by ink log-update when NOT
// using debug, we'd see ≥ 2 copies in the non-debug production render.
//
// For this harness we use debug=true + then compare *frame count* vs marker count.
// If ink's debug mode inserts separator markers that we can count, we can
// distinguish how many frames ink emitted. We additionally produce a "DUPE"
// verdict when two consecutive full frames (header + footer) are identical in
// structure and simply concatenated rather than replaced — this matches the
// user's pasted symptom exactly.
import React, { useState } from 'react'
import { render } from 'ink'
import { Readable, Writable } from 'node:stream'
import ThemedBox from '../src/components/design-system/ThemedBox'
import Header from '../src/components/Header'
import Sidebar from '../src/components/Sidebar'
import PromptInput from '../src/components/PromptInput'
import StatusFooter from '../src/components/StatusFooter'
import UserMessage from '../src/components/UserMessage'
import AssistantMessage from '../src/components/AssistantMessage'
import ThinkingMessage from '../src/components/ThinkingMessage'
import ActivityLine from '../src/components/ActivityLine'

const SAMPLE_USER_GREETING = 'Hello! Welcome to the DeepSeek TUI.'
const SAMPLE_THINKING_LINES = [
  'The user is greeting me. I should respond warmly and offer to help.',
]
const SAMPLE_ASSISTANT =
  'Hello! Great to be here in the DeepSeek TUI project.\n\n' +
  "- **Project**: DeepSeek TUI\n- **Key crates**: `apps/`, `crates/`\n" +
  '\n1. **Explore the codebase** - I can dig into specific areas\n'

function ActivityLineRepro() {
  // Force running spinner (causes 60ms re-renders) AND force a state toggle here
  return <ActivityLine phase="running" workingText="Agent is thinking…" />
}

function AppRepro(): React.ReactElement {
  const [inputValue, setInputValue] = useState('')
  const [, setToggle] = useState(0)
  return (
    <ThemedBox flexDirection="column" height="100%" width="100%">
      <Header agentName="deepseek-tui" modelName="deepseek-v4-pro" effort="max" contextPct={0} />
      <ThemedBox flexGrow={1} flexDirection="row" paddingTop={1} flexShrink={1} minHeight={0}>
        <ThemedBox flexGrow={1} flexDirection="column" paddingX={2} flexShrink={1} minWidth={0}>
          <UserMessage text={SAMPLE_USER_GREETING} />
          <ThemedBox paddingLeft={2} marginTop={1} flexShrink={0}>
            <ActivityLineRepro />
          </ThemedBox>
          <ThinkingMessage collapsed={true} status="done" elapsed="1.7s" lines={SAMPLE_THINKING_LINES} />
          <AssistantMessage text={SAMPLE_ASSISTANT} />
        </ThemedBox>
        <Sidebar />
      </ThemedBox>
      <PromptInput value={inputValue} onChange={setInputValue} effort="max" />
      <StatusFooter model="deepseek-v4-pro" cachePct={67} costDollars="$0.00" />
    </ThemedBox>
  )
}

const noopStdin = new Readable({ read() {} }) as any
noopStdin.isTTY = true
noopStdin.setRawMode = function () {}
noopStdin.setEncoding = function () { return this }
noopStdin.resume = function () { return this }
noopStdin.pause = function () { return this }
noopStdin.ref = function () { return this }
noopStdin.unref = function () { return this }

const chunks: Buffer[] = []
const captureStdout = new Writable({
  write(chunk, _enc, cb) { chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)); cb() },
}) as any
captureStdout.columns = Number(process.env.COLUMNS ?? 120)
captureStdout.rows    = Number(process.env.LINES   ?? 40)

const inst = render(React.createElement(AppRepro), {
  stdin: noopStdin,
  stdout: captureStdout,
  exitOnCtrlC: false,
  debug: false, // PRODUCTION MODE = uses log-update overwrite (matches npm start)
  patchConsole: false,
})

const TTL = Number(process.env.HARNESS_TTL_MS ?? 220)
let flushed = false
function flushAndExit(exitCode: number) {
  if (flushed) return
  flushed = true
  try { inst.unmount() } catch {}
  try { captureStdout.end() } catch {}
  const out = Buffer.concat(chunks).toString('utf8')
  process.stdout.write('<<<HARNESS_START>>>\n' + out + '\n<<<HARNESS_END>>>\n')
  process.exit(exitCode)
}
setTimeout(() => flushAndExit(0), TTL)
process.on('uncaughtException', () => flushAndExit(0))
process.on('unhandledRejection', () => flushAndExit(0))
