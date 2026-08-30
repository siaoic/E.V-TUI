// src/App.tsx
//
// 主布局（固定高度分区，杜绝溢出）：
//   Header(1) / Body(= rows - 固定区) / Composer(4) / Footer(1)
//
// Body 内的对话区由 MessageList 按实测高度自适应裁剪，绝不溢出到
// Composer；右侧 Sidebar 内容短，同样不会越过 Body 边界。
import React, { useState, useCallback } from 'react'
import { useInput, useApp, Box } from 'ink'
import ThemedBox from './components/design-system/ThemedBox'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import PromptInput from './components/PromptInput'
import StatusFooter from './components/StatusFooter'
import UserMessage from './components/UserMessage'
import AssistantMessage from './components/AssistantMessage'
import ThinkingMessage from './components/ThinkingMessage'
import ActivityLine from './components/ActivityLine'
import MessageList from './components/MessageList'

// ========== 示例数据 ==========
const SAMPLE_USER_GREETING = 'Hello! Welcome to the DeepSeek TUI.'
const SAMPLE_THINKING_LINES = [
  'The user is greeting me. I should respond warmly and offer to help.',
  "I should be aware of the project context but I don't need to do anything specific yet.",
  "Let me just give a friendly greeting and ask what they'd like to work on.",
]
const SAMPLE_ASSISTANT =
  'Hello! Great to be here in the DeepSeek TUI project.\n' +
  '\n' +
  "I'm your agentic coding assistant, ready to help with anything from code exploration and bug\n" +
  'fixes to feature development. Here\'s what I can see of the workspace:\n' +
  '\n' +
  '- **Project**: DeepSeek TUI (Rust-based terminal UI for interacting with DeepSeek models)\n' +
  '- **Key crates**: `apps/`, `crates/`, plus `npm/` and `python/` sub-projects\n' +
  '- **Current state**: I can check git status, run builds, tests, etc.\n' +
  '\n' +
  'What would you like to work on today? A few options:\n' +
  '\n' +
  '1. **Explore the codebase** - I can dig into specific areas or give you an overview\n' +
  '2. **Fix a bug or implement a feature** - point me at the issue or describe what you need\n' +
  '3. **Review or refactor** - I can analyze code quality, suggest improvements, and make changes\n' +
  '4. **Build & test** - kick off a build, run tests, or check lint\n' +
  '\n' +
  "Or just tell me what's on your mind!"

type Message = { id: number; text: string }

// ========== 固定高度常量 ==========
const HEADER_H = 1
const INPUT_H = 4
const INPUT_MARGIN_BOTTOM = 1
const FOOTER_H = 1
const BODY_PAD_TOP = 1

function App(): React.ReactElement {
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [thinkingCollapsed, setThinkingCollapsed] = useState(true)
  const nextId = React.useRef(0)
  const { exit } = useApp()

  // 全局按键：仅处理 Ctrl+C 与 Tab；字符输入/退格/回车交给 Composer。
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit()
      return
    }
    if (key.tab) {
      setThinkingCollapsed(c => !c)
    }
  })

  const handleSend = useCallback((text: string) => {
    const trimmed = text.trim()
    if (trimmed.length > 0) {
      nextId.current += 1
      setMessages(prev => [...prev, { id: nextId.current, text: trimmed }])
      setInputValue('')
    }
  }, [])

  const rows =
    process.stdout && typeof process.stdout.rows === 'number' && process.stdout.rows > 0
      ? process.stdout.rows
      : 40

  // Body 高度 = 总高 - 头部 - 输入框(含下边距) - 底部状态栏。
  // paddingTop 在 Body 内部消化，因此不额外扣除。
  const bodyHeight = Math.max(
    6,
    rows - HEADER_H - INPUT_H - INPUT_MARGIN_BOTTOM - FOOTER_H,
  )
  const messageMaxHeight = Math.max(4, bodyHeight - BODY_PAD_TOP)

  const blocks: React.ReactNode[] = [
    <UserMessage key="greet" text={SAMPLE_USER_GREETING} />,
    <Box key="activity" paddingLeft={2} marginTop={1} flexShrink={0}>
      <ActivityLine phase="done" elapsedMs={1700} />
    </Box>,
    <ThinkingMessage
      key="think"
      collapsed={thinkingCollapsed}
      status="done"
      elapsed="1.7s"
      lines={SAMPLE_THINKING_LINES}
    />,
    <AssistantMessage key="assistant" text={SAMPLE_ASSISTANT} />,
    ...messages.map(m => <UserMessage key={m.id} text={m.text} />),
  ]

  return (
    <ThemedBox flexDirection="column" height={rows} width="100%">
      {/* 顶部状态栏 */}
      <Header agentName="deepseek-tui" modelName="deepseek-v4-pro" effort="max" contextPct={0} />

      {/* 主体：对话区 + 侧栏，高度固定，不参与溢出 */}
      <ThemedBox
        height={bodyHeight}
        flexDirection="row"
        paddingTop={BODY_PAD_TOP}
        flexShrink={0}
        minHeight={0}
      >
        {/* 左侧对话区 */}
        <Box flexGrow={1} flexDirection="column" paddingX={2} flexShrink={1} minWidth={0}>
          <MessageList blocks={blocks} maxHeight={messageMaxHeight} />
        </Box>
        {/* 右侧 Sidebar */}
        <Sidebar />
      </ThemedBox>

      {/* Composer 输入气泡 */}
      <PromptInput value={inputValue} onChange={setInputValue} onSend={handleSend} effort="max" />

      {/* 底部状态栏 */}
      <StatusFooter model="deepseek-v4-pro" cachePct={67} costDollars="$0.00" />
    </ThemedBox>
  )
}
export default App
