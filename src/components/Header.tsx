import React from 'react'
import ThemedBox from './design-system/ThemedBox'
import ThemedText from './design-system/ThemedText'

export type HeaderProps = {
  /** 代理/会话名，默认 deepseek-tui */
  readonly agentName?: string
  /** 模型名，默认 deepseek-v4-pro */
  readonly modelName?: string
  /** 努力等级：min / low / med / high / max（默认 max） */
  readonly effort?: string
  /** 上下文压力百分比 0–100（默认 0） */
  readonly contextPct?: number
}

/**
 * 顶部状态栏：
 *   左：✦ dsh-TUI lite · {agentName} · {modelName}
 *   右：{effort}   ctx {pct}%
 *
 * 参考 dsh-TUI-main 顶部 header（非 LogoV2 splash），一行紧凑呈现。
 */
function Header({
  agentName = 'deepseek-tui',
  modelName = 'deepseek-v4-pro',
  effort = 'max',
  contextPct = 0,
}: HeaderProps): React.ReactElement {
  const ctxColor: 'error' | 'warning' | 'inactive' =
    contextPct >= 95 ? 'error' : contextPct >= 80 ? 'warning' : 'inactive'
  return (
    <ThemedBox
      flexDirection="row"
      height={1}
      paddingX={1}
      justifyContent="space-between"
      alignItems="center"
    >
      <ThemedBox flexGrow={1} flexShrink={1}>
        <ThemedText color="claude" bold wrap="truncate">
          ✦ Agent
        </ThemedText>
        <ThemedText dimColor wrap="truncate">
          {' ' + agentName + ' · ' + modelName}
        </ThemedText>
      </ThemedBox>
      <ThemedBox flexShrink={0}>
        <ThemedText color="permission" bold>
          {effort}
        </ThemedText>
        <ThemedText dimColor>{'  ctx '}</ThemedText>
        <ThemedText color={ctxColor}>{contextPct + '%'}</ThemedText>
      </ThemedBox>
    </ThemedBox>
  )
}

export default Header
