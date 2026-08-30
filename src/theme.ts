/**
 * dsh-tui 风格主题系统（Gentle Mist Blue 雾蓝家族）
 *
 * 参考 e:/AI/deepseek-tui-ts/dsh-TUI-main/src/theme.ts 的调色板。
 * 两套真彩主题：
 *   - dark： 雾蓝 + 暖灰白文字，适配暗色终端
 *   - light：品牌蓝 + 墨水色文字，适配浅色终端（雾蓝设计原版卡）
 *
 * 不做 OSC 11 自动检测，默认 dark。组件通过 getTheme / getActiveTheme /
 * setActiveTheme 切换主题。
 */

export type Theme = {
  text: string
  inverseText: string
  inactive: string
  inactiveShimmer: string
  subtle: string
  suggestion: string
  remember: string
  background: string
  claude: string
  claudeShimmer: string
  claudeBlue_FOR_SYSTEM_SPINNER: string
  claudeBlueShimmer_FOR_SYSTEM_SPINNER: string
  permission: string
  permissionShimmer: string
  planMode: string
  promptBorder: string
  promptBorderShimmer: string
  success: string
  error: string
  warning: string
  warningShimmer: string
  toolCardBackground: string
  toolCardBackgroundDim: string
  toolDotExec: string
  toolDotRead: string
  toolDotWrite: string
  toolDotWeb: string
  toolDotTask: string
  syntaxKeyword: string
  syntaxString: string
  syntaxComment: string
  syntaxNumber: string
  syntaxFunction: string
  syntaxType: string
  syntaxVariable: string
  syntaxOperator: string
  syntaxPunctuation: string
  syntaxConstant: string
  userMessageBackground: string
  userMessageBackgroundHover: string
  messageActionsBackground: string
  briefLabelYou: string
  briefLabelClaude: string
}

export const THEME_NAMES = ['dark', 'light'] as const
export type ThemeName = (typeof THEME_NAMES)[number] | string

// 将 HEX #RRGGBB 转换为 ink 接受的 rgb(R,G,B) 字符串
const rgb = (hex: string): string => {
  const n = parseInt(hex.slice(1), 16)
  return `rgb(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255})`
}

/**
 * Gentle Mist Blue dark：品牌蓝范围 #27478C–#ABC2EC，中性色来自
 * #F6F3ED / #343945 的暖灰家族。
 */
export const darkTheme: Theme = {
  text: rgb('#E8E6E0'),
  inverseText: rgb('#22262E'),
  inactive: rgb('#8D95A6'),
  inactiveShimmer: rgb('#AAB2C2'),
  subtle: rgb('#5E6673'),
  suggestion: rgb('#ABC2EC'),
  remember: rgb('#ABC2EC'),
  background: rgb('#5E88CC'),
  claude: rgb('#7DA1DE'),
  claudeShimmer: rgb('#ABC2EC'),
  claudeBlue_FOR_SYSTEM_SPINNER: rgb('#7DA1DE'),
  claudeBlueShimmer_FOR_SYSTEM_SPINNER: rgb('#ABC2EC'),
  permission: rgb('#ABC2EC'),
  permissionShimmer: rgb('#C9D7F2'),
  planMode: rgb('#7FAE99'),
  promptBorder: rgb('#55606F'),
  promptBorderShimmer: rgb('#7DA1DE'),
  success: rgb('#82B89D'),
  error: rgb('#DA8A93'),
  warning: rgb('#D8B270'),
  warningShimmer: rgb('#E4C78E'),
  toolCardBackground: rgb('#242B3A'),
  toolCardBackgroundDim: rgb('#1C2330'),
  toolDotExec: rgb('#7FAE99'),
  toolDotRead: rgb('#82B8C7'),
  toolDotWrite: rgb('#B3A0D4'),
  toolDotWeb: rgb('#7DA1DE'),
  toolDotTask: rgb('#D194AE'),
  syntaxKeyword: rgb('#78A0D6'),
  syntaxString: rgb('#79AD91'),
  syntaxComment: rgb('#74808D'),
  syntaxNumber: rgb('#C89B70'),
  syntaxFunction: rgb('#6FAEB5'),
  syntaxType: rgb('#A98FBF'),
  syntaxVariable: rgb('#C9D1D9'),
  syntaxOperator: rgb('#93A1B0'),
  syntaxPunctuation: rgb('#7A8694'),
  syntaxConstant: rgb('#C98291'),
  // Kimi 风格中 user turn 无底色，但我们需要一个紧凑的背景色以示区分
  userMessageBackground: rgb('#20283A'),
  userMessageBackgroundHover: rgb('#3B5BDB'),
  messageActionsBackground: rgb('#2E333D'),
  briefLabelYou: rgb('#FFDF80'),
  briefLabelClaude: rgb('#7DA1DE'),
}

/**
 * Gentle Mist Blue light：原版卡片。背景 #F6F3ED，正文墨水 #343945。
 */
export const lightTheme: Theme = {
  text: rgb('#343945'),
  inverseText: rgb('#F6F3ED'),
  inactive: rgb('#8991A0'),
  inactiveShimmer: rgb('#626978'),
  subtle: rgb('#A6ADBA'),
  suggestion: rgb('#3F6CC4'),
  remember: rgb('#27478C'),
  background: rgb('#3F6CC4'),
  claude: rgb('#3F6CC4'),
  claudeShimmer: rgb('#5E88CC'),
  claudeBlue_FOR_SYSTEM_SPINNER: rgb('#3F6CC4'),
  claudeBlueShimmer_FOR_SYSTEM_SPINNER: rgb('#5E88CC'),
  permission: rgb('#3F6CC4'),
  permissionShimmer: rgb('#5E88CC'),
  planMode: rgb('#4E9675'),
  promptBorder: rgb('#ABC2EC'),
  promptBorderShimmer: rgb('#7DA1DE'),
  success: rgb('#4E9675'),
  error: rgb('#C65D6B'),
  warning: rgb('#C08A3E'),
  warningShimmer: rgb('#D0A050'),
  toolCardBackground: rgb('#E9EFF9'),
  toolCardBackgroundDim: rgb('#DEE7F4'),
  toolDotExec: rgb('#4E7A4E'),
  toolDotRead: rgb('#3F7E8F'),
  toolDotWrite: rgb('#7A5CA8'),
  toolDotWeb: rgb('#4A63A8'),
  toolDotTask: rgb('#B04A5A'),
  syntaxKeyword: rgb('#3F68B5'),
  syntaxString: rgb('#3F805F'),
  syntaxComment: rgb('#7D858F'),
  syntaxNumber: rgb('#A7652B'),
  syntaxFunction: rgb('#2E7E8A'),
  syntaxType: rgb('#7E55A4'),
  syntaxVariable: rgb('#343945'),
  syntaxOperator: rgb('#5B6672'),
  syntaxPunctuation: rgb('#9AA0A8'),
  syntaxConstant: rgb('#A84472'),
  userMessageBackground: rgb('#ECE4CF'), // 暖米色浅底
  userMessageBackgroundHover: rgb('#DCE4FB'),
  messageActionsBackground: rgb('#E4D9E5'),
  briefLabelYou: rgb('#A67600'),
  briefLabelClaude: rgb('#3F6CC4'),
}

const THEMES: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme,
}

let activeThemeName: string = 'dark'

/** 根据主题名获取调色板；未知名回退到 dark。 */
export function getTheme(name: string): Theme {
  return THEMES[name] ?? darkTheme
}

/** 获取当前激活的调色板。 */
export function getActiveTheme(): Theme {
  return getTheme(activeThemeName)
}

/** 切换当前激活主题；未知名无效。 */
export function setActiveTheme(name: string): void {
  if (THEMES[name]) activeThemeName = name
}

/** 取得当前激活主题名（用于未来持久化或显示）。 */
export function getActiveThemeName(): string {
  return activeThemeName
}

/**
 * 判断一个字符串是否是 raw 颜色（不是语义键）：
 *   rgb(...) / #... / ansi256(...) / ansi:...
 * 供 ThemedBox / ThemedText 解析时使用。
 */
export function isRawColor(v?: string): v is string {
  if (!v) return false
  return (
    v.startsWith('rgb(') ||
    v.startsWith('#') ||
    v.startsWith('ansi256(') ||
    v.startsWith('ansi:')
  )
}

/**
 * 解析颜色：若是语义键则从主题取；若为空则返回 undefined（由 ink 忽略）。
 */
export function resolveColor(
  color: keyof Theme | string | undefined,
  theme: Theme,
): string | undefined {
  if (!color) return undefined
  if (isRawColor(color)) return color
  const resolved = (theme as unknown as Record<string, string | undefined>)[color]
  if (resolved === undefined || resolved === '') return undefined
  return resolved
}
