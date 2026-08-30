// src/components/MessageList.tsx
//
// 对话区滚动视口。修复要点：
//   - 旧布局把整段对话塞进 flexGrow 区域，内容超出后 Ink 不会裁剪，
//     溢出文本直接盖到下方 Composer 输入框 / Footer 上（用户看到的
//     「输入气泡显示错位」）。
//   - 本组件用 ink 的 measureElement 实测渲染高度，自动计算「能完整放
//     下多少个消息块」fit，并从最新一条开始向上填充，始终锚定底部；
//     溢出内容只被裁剪在对话区内部，绝不会侵入输入框。
//   - fit 采用「只收缩不自动增长」的单调策略（消息只增不减），避免
//     增长/收缩互相振荡导致无限渲染；终端尺寸变大时由 resize 重置。
//   - 支持 ↑ / ↓ 滚动查看更早的消息，滚动时显示 "N older" 提示行。
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react'
import { Box, measureElement, useInput } from 'ink'
import ThemedBox from './design-system/ThemedBox'
import ThemedText from './design-system/ThemedText'

export type MessageListProps = {
  /** 有序消息块，最后一个为最新。 */
  readonly blocks: readonly React.ReactNode[]
  /** 对话区可用最大高度（行数）。 */
  readonly maxHeight: number
}

/**
 * 一个「贴底 + 自适应裁剪 + 可滚动」的消息视口。
 * fit：能放下多少块；offset：向上回看多少块（0 = 最新）。
 */
function MessageList({ blocks, maxHeight }: MessageListProps): React.ReactElement {
  const total = blocks.length
  const [fit, setFit] = useState<number>(total)
  const [offset, setOffset] = useState<number>(0)
  const ref = useRef<any>(null)

  // 终端尺寸变化（通常是变高）：重置为尽量多显示，交给测量逻辑重新适配
  useEffect(() => {
    const onResize = () => {
      setFit(blocks.length)
    }
    process.stdout.on('resize', onResize)
    return () => {
      process.stdout.off('resize', onResize)
    }
  }, [blocks.length])

  // 消息数量变化：保留已有 fit（不整屏闪回），新消息自然向下追加；
  // 若放不下，测量逻辑会再收缩。
  useEffect(() => {
    setFit(prev => Math.min(total, prev))
    setOffset(0)
  }, [total])

  // 核心：实测当前可见窗口的高度，若溢出则收缩 fit（单调递减）。
  // 每次收缩都保证至少减 1，比例跳跃收敛快，且绝不在收缩后自动增长，
  // 从机制上杜绝 grow/shrink 振荡。目标高度预留 1 行给 "older" 提示。
  useLayoutEffect(() => {
    if (!ref.current || total === 0) return
    const target = maxHeight - 1
    if (target <= 0) return
    const { height } = measureElement(ref.current)
    if (height > target + 0.5 && fit > 1) {
      const next = Math.max(1, Math.floor((fit * target) / Math.max(height, 1)))
      setFit(prev => (next < prev ? next : prev - 1))
    }
  }, [fit, maxHeight, total])

  // fit 变化后收紧 offset，防止越界
  useEffect(() => {
    setOffset(o => Math.max(0, Math.min(Math.max(total - fit, 0), o)))
  }, [fit, total])

  const start = Math.max(0, total - fit - offset)
  const end = Math.max(0, total - offset)
  const visible = blocks.slice(start, end)
  const hiddenAbove = start
  const canScrollUp = hiddenAbove > 0
  const canScrollDown = offset > 0

  // ↑ / ↓ 滚动（不与文本输入的左右键冲突）
  useInput(
    (_input, key) => {
      if (key.upArrow) setOffset(o => Math.min(Math.max(total - fit, 0), o + 1))
      if (key.downArrow) setOffset(o => Math.max(0, o - 1))
    },
    { isActive: canScrollUp || canScrollDown },
  )

  if (total === 0) {
    return <ThemedBox flexGrow={1} />
  }

  return (
    // 外层撑满可用高度；spacer(flexGrow) 把消息块推到底部，贴住 Composer，
    // 符合聊天应用的贴底阅读习惯，也避免最新消息与输入框之间留大片空白。
    <ThemedBox flexDirection="column" flexGrow={1} flexShrink={1} minHeight={0}>
      {hiddenAbove > 0 && (
        <ThemedBox flexDirection="row" height={1} flexShrink={0}>
          <ThemedText dimColor wrap="truncate">
            {'↑ ' +
              hiddenAbove +
              ' older message' +
              (hiddenAbove > 1 ? 's' : '') +
              ' · ↑/↓ to scroll'}
          </ThemedText>
        </ThemedBox>
      )}
      {/* 弹性 spacer：把可见消息块压到最底部 */}
      <ThemedBox flexGrow={1} flexShrink={1} minHeight={0} />
      {/* 用原生 Box 挂 ref（ThemedBox 不透传 ref），测量真实渲染高度 */}
      <Box ref={ref} flexDirection="column" flexShrink={0}>
        {visible}
      </Box>
    </ThemedBox>
  )
}
export default MessageList
