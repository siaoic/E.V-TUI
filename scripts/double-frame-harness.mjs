// scripts/double-frame-harness.mjs — Phase-2+ feedback loop.
// Detects the EXACT symptom the user reported: the screen renders TWICE
// (Header / Body / Prompt / Footer stacked twice).
//
// Concrete PASS/FAIL signal: after stripping ANSI escapes, if we find
// "StatusFooter prefix" followed by another "Header prefix" (i.e. a brand-new
// Header appearing AFTER the Footer line), that proves a full second frame
// was appended below the first instead of overwriting it in-place.
//
// Uses harness-entry-repro.tsx which renders in PRODUCTION mode
// (debug=false → log-update overwrite, matching `npm start`) but with a
// running ActivityLine so ink re-renders at least once (the real bug trigger
// is "first state update after mount").
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const KILL_AFTER_MS = Number(process.env.KILL_AFTER_MS ?? 2000)
const HEADER = '\u2726 Agent'
// Footer left-segment marker (see StatusFooter.tsx: 'agent · ' + model)
const FOOTER = 'agent · deepseek-v4-pro'

const isWindows = process.platform === 'win32'
const cmd = isWindows ? 'powershell.exe' : 'npx'
const args = isWindows
  ? ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command',
     '$ErrorActionPreference="SilentlyContinue"; $env:FORCE_COLOR="1"; $env:COLUMNS="' + (process.env.COLUMNS ?? '120') + '"; $env:LINES="' + (process.env.LINES ?? '40') + '"; $env:CI="true"; & npx tsx scripts/harness-entry-repro.tsx; exit $LASTEXITCODE']
  : ['tsx', 'scripts/harness-entry-repro.tsx']

const child = spawn(cmd, args, {
  cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], shell: false,
  env: isWindows ? process.env : {
    ...process.env, FORCE_COLOR: '1', CI: 'true',
    COLUMNS: process.env.COLUMNS ?? '120',
    LINES:   process.env.LINES   ?? '40',
  },
})

let stdout = ''
let stderr = ''
child.stdout.setEncoding('utf8')
child.stderr.setEncoding('utf8')
child.stdout.on('data', d => { stdout += d })
child.stderr.on('data', d => { stderr += d })

const killTimer = setTimeout(() => { try { child.kill('SIGKILL') } catch {} }, KILL_AFTER_MS)

child.on('close', (code, signal) => {
  clearTimeout(killTimer)
  // Strip SGR / cursor-move / erase-* ANSI sequences but keep newlines.
  const stripped = stdout
    .replace(/\x1B\[[0-9;?]*[A-Za-z]/g, '')   // CSI: color, cursor, clear
    .replace(/\x1B[NO][\x40-\x7E]/g, '')       // SS2/SS3 2-char
    .replace(/\r/g, '\n')
  const s = stripped.indexOf('<<<HARNESS_START>>>')
  const e = stripped.indexOf('<<<HARNESS_END>>>', s + 1)
  const block = (s >= 0 && e >= 0) ? stripped.slice(s + 18, e) : stripped
  const headerCount = block.split(HEADER).length - 1
  const footerCount = block.split(FOOTER).length - 1

  // The specific anomaly: any footer occurrence before a header occurrence.
  const lastFooterIdx = block.lastIndexOf(FOOTER)
  const anyHeaderAfterFooter =
    lastFooterIdx >= 0 && block.indexOf(HEADER, lastFooterIdx + FOOTER.length) >= 0

  const verdict =
    anyHeaderAfterFooter || headerCount >= 2 ? 'RED' :
    (headerCount === 0 ? 'NO_MARKER' : 'GREEN')

  console.log(JSON.stringify({
    verdict,
    headerCount, footerCount,
    anyHeaderAfterFooter,
    stdoutByteLen: stdout.length,
    stderrHead: stderr.slice(0, 600),
    exit: { code, signal },
    // Print last 1200 chars; if RED we'll see footer→header transition there.
    sampleTail: block.slice(-1200),
    sampleHead: block.slice(0, 1200),
  }, null, 2))
  process.exit(verdict === 'RED' ? 1 : 0)
})
