import React from 'react'
import ThemedBox from './design-system/ThemedBox'
import ThemedText from './design-system/ThemedText'
import ContextBar from './ContextBar'

export type StatusFooterProps = {
  readonly model?: string
  readonly cachePct?: number
  readonly costDollars?: string
}

/**
 * 底部状态栏：
 *   [左] agent · deepseek-v4-pro
 *   [中] ContextBar（四段 █ 条）
 *   [右] cache 67%   $0.00
 * 高度 1 行，paddingX=1。
 */
function StatusFooter({
  model = 'deepseek-v4-pro',
  cachePct = 67,
  costDollars = '$0.00',
}: StatusFooterProps): React.ReactElement {
  return (
    <ThemedBox
      flexDirection="row"
      height={1}
      paddingX={1}
      justifyContent="space-between"
      alignItems="center"
    >
      <ThemedBox flexGrow={0} flexShrink={1} minWidth={0}>
        <ThemedText dimColor wrap="truncate">
          agent · {model}
        </ThemedText>
      </ThemedBox>
      <ThemedBox flexGrow={0} flexShrink={0} paddingX={1}>
        <ContextBar width={20} />
      </ThemedBox>
      <ThemedBox flexGrow={0} flexShrink={0}>
        <ThemedText dimColor>cache {cachePct + '%'}</ThemedText>
        <ThemedText color="warning">{'  ' + costDollars}</ThemedText>
      </ThemedBox>
    </ThemedBox>
  )
}

export default StatusFooter
