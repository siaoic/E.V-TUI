import React from 'react'
import { Text, type TextProps } from 'ink'
import { getActiveTheme, resolveColor, type Theme } from '../../theme'

type ThemedColorKeys = keyof Theme | string

export type ThemedTextProps = Omit<TextProps, 'color' | 'backgroundColor'> & {
  readonly color?: ThemedColorKeys
  readonly backgroundColor?: ThemedColorKeys
  /** 等价于 color='inactive'；显式 color 优先级更高。 */
  readonly dimColor?: boolean
}

/**
 * 主题感知的 Text。color / backgroundColor 接受语义键或 raw color。
 * `dimColor` 等价于 `color="inactive"`，与 dsh-TUI 语义一致。
 */
function ThemedText({
  color,
  backgroundColor,
  dimColor = false,
  children,
  ...rest
}: React.PropsWithChildren<ThemedTextProps>): React.ReactElement {
  const theme = getActiveTheme()
  const resolvedColor =
    color !== undefined && color !== null
      ? resolveColor(color, theme)
      : dimColor
        ? resolveColor('inactive', theme)
        : undefined
  const resolvedBg = resolveColor(backgroundColor, theme)
  return (
    <Text {...(rest as TextProps)} color={resolvedColor} backgroundColor={resolvedBg}>
      {children}
    </Text>
  )
}

export default ThemedText
