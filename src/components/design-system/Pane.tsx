import React from 'react'
import ThemedBox from './ThemedBox'
import { Divider } from './Divider'
import type { Theme } from '../../theme'

export type PaneProps = {
  readonly children: React.ReactNode
  /** 顶部分隔线的主题色键 */
  readonly color?: keyof Theme
  /** 左右内边距，默认 2（与 dsh-TUI 一致） */
  readonly paddingX?: number
}

/**
 * 斜线命令风格的面板：顶部一条带颜色的 Divider + 左右内边距包裹内容。
 * 参考 dsh-TUI-main/src/components/design-system/Pane.tsx。
 */
export function Pane({
  children,
  color = 'permission',
  paddingX = 2,
}: PaneProps): React.ReactElement {
  return (
    <ThemedBox flexDirection="column" paddingTop={1}>
      <Divider color={color} />
      <ThemedBox flexDirection="column" paddingX={paddingX}>
        {children}
      </ThemedBox>
    </ThemedBox>
  )
}

export default Pane
