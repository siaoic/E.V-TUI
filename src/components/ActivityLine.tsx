import React from 'react'
import ThemedText from './design-system/ThemedText'

export type ActivityPhase = 'idle' | 'running' | 'done'

export type ActivityLineProps = {
  readonly phase: ActivityPhase
  /** done 阶段显示的耗时，单位毫秒。 */
  readonly elapsedMs?: number
  /** running 阶段显示的文案，默认 'Agent is thinking…'。 */
  readonly workingText?: string
}

const BRAILLE_FRAMES = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
const FRAME_INTERVAL_MS = 60

function formatElapsed(ms: number): string {
  if (ms < 1000) return ms + 'ms'
  return (ms / 1000).toFixed(1).replace(/\.0$/, '') + 's'
}

/**
 * 工作活动行（dsh-TUI ActivityLine 简化版）。
 *   idle：    · idle
 *   running： ⠋ Agent is thinking…
 *   done：    ● done · 1.7s
 *
 * running 阶段通过 setInterval 每 60ms 更新 spinner 帧。
 */
function ActivityLine({
  phase,
  elapsedMs = 0,
  workingText = 'Agent is thinking…',
}: ActivityLineProps): React.ReactElement {
  const [frameIdx, setFrameIdx] = React.useState(0)

  React.useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => {
      setFrameIdx(i => (i + 1) % BRAILLE_FRAMES.length)
    }, FRAME_INTERVAL_MS)
    return () => clearInterval(id)
  }, [phase])

  if (phase === 'idle') {
    return <ThemedText dimColor>· idle</ThemedText>
  }

  if (phase === 'running') {
    const glyph = BRAILLE_FRAMES[frameIdx] ?? '·'
    return (
      <ThemedText wrap="truncate">
        <ThemedText color="claudeBlue_FOR_SYSTEM_SPINNER">{glyph}</ThemedText>
        <ThemedText color="text">{' ' + workingText}</ThemedText>
      </ThemedText>
    )
  }

  return (
    <ThemedText wrap="truncate">
      <ThemedText color="claude" bold>
        ●
      </ThemedText>
      <ThemedText color="claude">{' done · ' + formatElapsed(elapsedMs)}</ThemedText>
    </ThemedText>
  )
}

export default ActivityLine
