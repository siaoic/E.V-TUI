import React from 'react'
import ThemedText from './ThemedText'

export type StatusKind =
  | 'success'
  | 'error'
  | 'warning'
  | 'inactive'
  | 'running'

const GLYPHS: Record<StatusKind, string> = {
  success: '✔',
  error: '✗',
  warning: '⚠',
  inactive: '·',
  running: '⠋',
}

const COLORS: Record<StatusKind, 'success' | 'error' | 'warning' | 'inactive' | 'claude'> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  inactive: 'inactive',
  running: 'claude',
}

export type StatusIconProps = {
  readonly kind: StatusKind
}

/**
 * 单行状态图标：根据状态返回对应单字符并以主题语义色着色。
 */
export function StatusIcon({ kind }: StatusIconProps): React.ReactElement {
  return <ThemedText color={COLORS[kind]}>{GLYPHS[kind]}</ThemedText>
}

export default StatusIcon
