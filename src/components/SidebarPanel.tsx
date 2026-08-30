// src/components/SidebarPanel.tsx
import React from 'react'
import ThemedBox from './design-system/ThemedBox'
import { Divider } from './design-system/Divider'
import type { Theme } from '../theme'

export type SidebarPanelProps = {
  readonly title: string
  readonly children: React.ReactNode
  /** 标题分隔线颜色键，默认 permission（与 dsh-TUI Pane 一致） */
  readonly dividerColor?: keyof Theme
}

/**
 * 侧栏面板：
 *   ──── {title} ────
 *   {内容，paddingX=2}
 * 不固定高度，按内容自适应。
 */
function SidebarPanel({
  title,
  children,
  dividerColor = 'permission',
}: SidebarPanelProps): React.ReactElement {
  return (
    <ThemedBox flexDirection="column" marginBottom={1}>
      <Divider title={title} color={dividerColor} />
      <ThemedBox flexDirection="column" paddingX={2} paddingY={1}>
        {children}
      </ThemedBox>
    </ThemedBox>
  )
}

export default SidebarPanel