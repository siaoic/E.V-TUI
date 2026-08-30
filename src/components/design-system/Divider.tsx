import React from 'react'
import ThemedBox from './ThemedBox'
import ThemedText from './ThemedText'
import type { Theme } from '../../theme'

export type DividerProps = {
  /** 分隔线字符，默认 '─' */
  readonly char?: string
  /**
   * 显式分隔线总宽（字符列），默认 undefined。
   *
   * 不传宽度（默认）：交给 flex + wrap=truncate 在父容器可用宽度内自适应，
   * 这是 SidebarPanel / Pane 等受限子容器中推荐的方式（彻底避免用
   * process.stdout.columns 这种「终端全宽」来算局部宽度产生的溢出 / 换行 /
   * 残留行，FIX-C 见下）。
   */
  readonly width?: number
  /** 水平内边距（仅显式传 width 时生效，从总宽里扣掉） */
  readonly padding?: number
  /** 居中标题；太长则退化为纯横线 */
  readonly title?: string
  /** 主题颜色键；不传则默认 dim 色 */
  readonly color?: keyof Theme
}

// FIX-C（H3 假设 — Divider 宽度绝对化导致 Sidebar 内溢出换行）：
//   旧实现用 process.stdout.columns（终端全宽）作为默认宽度。在 Sidebar（仅 30%
//   宽）等受限子容器中，Divider 实际宽度远超父容器，实际文本会被 wrap 成 2 行，
//   但这些额外的 wrap 行并没有被 Ink/Yoga 计入布局高度，Ink log-update 在重绘时
//   也只按 1 行去擦除 → 残留 1 行留在屏幕上。每一次 React setState 触发重绘就多
//   残留 N 行，累积到一整屏的偏移后，视觉上就呈现出「完整上一帧 + 紧接完整下一
//   帧」的双帧堆叠症状。
//
//   新实现：不传 width 时一律走「flex 三段式」。非常长的 ─ 串分别放在左右两段
//   flexGrow=1 的 ThemedBox 里，再通过 wrap=truncate 按实际分配宽度裁掉，右端
//   截断不会影响 title 的显示，最终总渲染高度永远是精确 1 行。

// 足够覆盖任何实际父容器宽度（> 30000 列），最终由父容器截断
const VERY_LONG = 32767

/** 水平分隔线（可带居中标题），参考 dsh-TUI 设计系统同名组件。 */
export function Divider({
  char = '─',
  width,
  padding = 0,
  title,
  color,
}: DividerProps): React.ReactElement | null {
  const styledProps = color ? { color: color as keyof Theme } : { dimColor: true }
  const line = char.repeat(VERY_LONG)

  // 显式指定宽度（仅给调用方保留精确控制；SidebarPanel 不传 width）
  if (typeof width === 'number' && width > 0) {
    const totalWidth = Math.max(0, width - padding)
    if (totalWidth <= 0) return null

    const titleWidth = title
      ? Array.from(title).reduce((acc, ch) => acc + (/[\u2E80-\u9FFF]/.test(ch) ? 2 : 1), 0)
      : 0

    if (title && titleWidth + 2 < totalWidth) {
      const lineLen = totalWidth - titleWidth - 2
      const leftLen = Math.floor(lineLen / 2)
      const rightLen = lineLen - leftLen
      return (
        <ThemedText wrap="truncate" {...styledProps}>
          {char.repeat(leftLen)} {title} {char.repeat(rightLen)}
        </ThemedText>
      )
    }

    return (
      <ThemedText wrap="truncate" {...styledProps}>
        {char.repeat(totalWidth)}
      </ThemedText>
    )
  }

  // Flex 三段式：[ left ───────────┤ Title ├─────────── right ]
  // flexGrow=1 + veryLong + truncate = 每一侧都按剩余空间自动填满并精确裁到 1 行，
  // 绝不会出现 wrap，高度恒为 1 行。
  if (!title) {
    return (
      <ThemedBox width="100%" flexDirection="row" height={1} flexShrink={0}>
        <ThemedBox flexGrow={1} minWidth={0} flexShrink={1}>
          <ThemedText wrap="truncate" {...styledProps}>
            {line}
          </ThemedText>
        </ThemedBox>
      </ThemedBox>
    )
  }

  return (
    <ThemedBox width="100%" flexDirection="row" height={1} flexShrink={0} alignItems="center">
      <ThemedBox flexGrow={1} minWidth={0} flexShrink={1}>
        <ThemedText wrap="truncate" {...styledProps}>
          {line}
        </ThemedText>
      </ThemedBox>
      <ThemedBox flexShrink={0} paddingX={1}>
        <ThemedText {...styledProps}>{title}</ThemedText>
      </ThemedBox>
      <ThemedBox flexGrow={1} minWidth={0} flexShrink={1}>
        <ThemedText wrap="truncate" {...styledProps}>
          {line}
        </ThemedText>
      </ThemedBox>
    </ThemedBox>
  )
}

export default Divider
