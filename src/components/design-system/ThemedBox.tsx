import React from 'react'
import { Box, type BoxProps } from 'ink'
import { getActiveTheme, resolveColor, type Theme } from '../../theme'

type ThemedColorKeys = keyof Theme | string

/** Colors we add that aren't on ink 4's BoxProps but still work at runtime. */
type ExtraColorStyles = {
  readonly backgroundColor?: ThemedColorKeys
  readonly borderColor?: ThemedColorKeys
  readonly borderTopColor?: ThemedColorKeys
  readonly borderBottomColor?: ThemedColorKeys
  readonly borderLeftColor?: ThemedColorKeys
  readonly borderRightColor?: ThemedColorKeys
}

export type ThemedBoxProps = Omit<BoxProps, keyof ExtraColorStyles> &
  ExtraColorStyles

/**
 * 主题感知的 Box。对所有颜色 prop 先按 theme key 解析；
 * 命中 `rgb(` / `#` 开头的 raw color 则直接透传。
 *
 * 用法与 ink 的 `<Box>` 完全相同：
 *   <ThemedBox borderColor="permission" backgroundColor="toolCardBackground" />
 */
function ThemedBox({
  borderColor,
  borderTopColor,
  borderBottomColor,
  borderLeftColor,
  borderRightColor,
  backgroundColor,
  children,
  ...rest
}: React.PropsWithChildren<ThemedBoxProps>): React.ReactElement {
  const theme = getActiveTheme()
  const props = {
    ...rest,
    borderColor: resolveColor(borderColor, theme),
    borderTopColor: resolveColor(borderTopColor, theme),
    borderBottomColor: resolveColor(borderBottomColor, theme),
    borderLeftColor: resolveColor(borderLeftColor, theme),
    borderRightColor: resolveColor(borderRightColor, theme),
    backgroundColor: resolveColor(backgroundColor, theme),
  } as unknown as React.ComponentProps<typeof Box>
  return <Box {...props}>{children}</Box>
}

export default ThemedBox
