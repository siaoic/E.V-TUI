import React from 'react'
import ThemedBox from './design-system/ThemedBox'
import ThemedText from './design-system/ThemedText'

export type SegmentKey = 'system' | 'user' | 'tools' | 'free'

const SEGMENT_ORDER: SegmentKey[] = ['system', 'user', 'tools', 'free']

// 固定示例比例（3 : 4 : 2 : 1），总和为 10
const SEGMENT_RATIO: Record<SegmentKey, number> = {
  system: 3,
  user: 4,
  tools: 2,
  free: 1,
}

const SEGMENT_COLOR: Record<
  SegmentKey,
  'suggestion' | 'briefLabelYou' | 'toolDotExec' | 'inactive'
> = {
  system: 'suggestion',
  user: 'briefLabelYou',
  tools: 'toolDotExec',
  free: 'inactive',
}

export type ContextBarProps = {
  /** 总宽（字符列）；默认 20。 */
  readonly width?: number
  /** 填充字符，默认 '█'。 */
  readonly fill?: string
}

/**
 * 上下文条：System / User / Tools / Free 四段按固定比例 1 行条形。
 * 示例仅静态显示，不接真实数据。
 */
function ContextBar({ width = 20, fill = '█' }: ContextBarProps): React.ReactElement {
  const totalRatio = SEGMENT_ORDER.reduce((acc, k) => acc + SEGMENT_RATIO[k], 0)
  const ratios = SEGMENT_ORDER.map(k => SEGMENT_RATIO[k])
  const exact = ratios.map(r => (r / totalRatio) * width)
  const floors = exact.map(v => Math.floor(v))
  let sum = floors.reduce((a, b) => a + b, 0)
  const remainders = exact
    .map((v, i) => ({ i, r: v - floors[i] }))
    .sort((a, b) => b.r - a.r)
  const counts = [...floors]
  let rIdx = 0
  while (sum < width) {
    counts[remainders[rIdx % remainders.length].i] += 1
    sum += 1
    rIdx += 1
  }
  return (
    <ThemedBox flexDirection="row" width={width} height={1} flexShrink={0}>
      {SEGMENT_ORDER.map((key, idx) => {
        const n = counts[idx] ?? 0
        if (n <= 0) return null
        return (
          <ThemedText key={key} color={SEGMENT_COLOR[key]}>
            {fill.repeat(n)}
          </ThemedText>
        )
      })}
    </ThemedBox>
  )
}

export default ContextBar
