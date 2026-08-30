import React from 'react'
import ThemedBox from './design-system/ThemedBox'
import ThemedText from './design-system/ThemedText'

export type ThinkingStatus = 'thinking' | 'done'

export type ThinkingMessageProps = {
  readonly collapsed: boolean
  readonly status: ThinkingStatus
  readonly elapsed: string
  readonly lines: readonly string[]
}

/**
 * Thinking 引述块（dsh-TUI 风格）：
 * 折叠： ▸ thinking  done · 1.7s
 * 展开： 标题行
 *        │ line 1
 *        │ line 2
 */
function ThinkingMessage({
  collapsed,
  status,
  elapsed,
  lines,
}: ThinkingMessageProps): React.ReactElement {
  const arrow = collapsed ? '▸' : '▾'
  const statusColor: 'claudeBlue_FOR_SYSTEM_SPINNER' | 'inactive' =
    status === 'thinking' ? 'claudeBlue_FOR_SYSTEM_SPINNER' : 'inactive'
  return (
    <ThemedBox flexDirection="column" marginTop={1} paddingLeft={2}>
      <ThemedBox flexDirection="row" alignItems="center" height={1} flexShrink={0}>
        <ThemedText color="inactive" bold>
          {arrow}
        </ThemedText>
        <ThemedText>{' thinking  '}</ThemedText>
        <ThemedText color={statusColor}>{status}</ThemedText>
        <ThemedText dimColor>{' · ' + elapsed}</ThemedText>
      </ThemedBox>
      {!collapsed && lines.length > 0 && (
        <ThemedBox flexDirection="column" paddingLeft={2} flexShrink={0}>
          {lines.map((ln, idx) => (
            <ThemedBox key={idx} flexDirection="row" alignItems="flex-start" flexShrink={0}>
              <ThemedBox width={2} flexShrink={0}>
                <ThemedText color="subtle">│</ThemedText>
              </ThemedBox>
              <ThemedBox flexGrow={1} minWidth={0}>
                <ThemedText dimColor wrap="wrap">
                  {ln}
                </ThemedText>
              </ThemedBox>
            </ThemedBox>
          ))}
        </ThemedBox>
      )}
      {!collapsed && lines.length === 0 && (
        <ThemedText dimColor>{' '}</ThemedText>
      )}
    </ThemedBox>
  )
}

export default ThinkingMessage
