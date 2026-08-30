// src/components/PromptInput.tsx
//
// 输入气泡（Composer）。修复要点：
//   - 删除原先「手动读取 process.stdin + setRawMode」的实现。
//     那套实现会在第一次按键后把 raw mode 关掉，导致后续输入失效、
//     与 Ink 自身的 useInput 抢事件，造成输入错位/错乱。
//   - 改用 ink-text-input：由 Ink 统一管理 raw mode / 光标 / 焦点，
//     正确支持退格、左右方向键移动光标、Enter 提交，且带占位文案。
import React from 'react'
import { Box } from 'ink'
import TextInput from 'ink-text-input'
import ThemedBox from './design-system/ThemedBox'
import ThemedText from './design-system/ThemedText'

export type PromptInputProps = {
  readonly value: string
  readonly onChange: (next: string) => void
  /** 回车提交；收到的是输入框当前完整文本。 */
  readonly onSend?: (text: string) => void
  readonly effort?: string
  readonly placeholder?: string
}

/**
 * Composer 输入气泡（简洁版）：
 *   ╭──────────────────────────────────────────────╮
 *   │ >                                          │
 *   ╰──────────────────────────────────────────────╯
 *
 * 固定高度 3（边框 2 行 + 输入行 1 行），
 * 作为底部固定区块绝不参与 flex 收缩，避免与对话区互相挤压。
 */
function PromptInput({
  value,
  onChange,
  onSend,
  effort,
  placeholder = '',
}: PromptInputProps): React.ReactElement {
  return (
    <ThemedBox
      flexDirection="column"
      borderStyle="round"
      borderColor="promptBorderShimmer"
      marginX={1}
      marginBottom={1}
      paddingX={1}
      paddingY={0}
      height={3}
      flexShrink={0}
      flexGrow={0}
    >
      {/* 输入行：真正的文本输入，占满剩余宽度并截断 */}
      <ThemedBox flexDirection="row" height={1} flexShrink={0} alignItems="center">
        <ThemedText color="permission" bold>
          ❯
        </ThemedText>
        <Box flexGrow={1} flexShrink={1} minWidth={0} marginLeft={1}>
          <TextInput
            value={value}
            onChange={onChange}
            onSubmit={onSend}
            placeholder={placeholder}
          />
        </Box>
      </ThemedBox>
    </ThemedBox>
  )
}
export default PromptInput