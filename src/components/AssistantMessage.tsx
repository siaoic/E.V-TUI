import React from 'react'
import ThemedBox from './design-system/ThemedBox'
import ThemedText from './design-system/ThemedText'
export type AssistantMessageProps = {
  /** 助手纯文本；支持 **bold**、`inline-code`、- / 1. 列表缩进的轻量渲染。 */
  readonly text: string
}
type Segment =
  | { kind: 'plain'; value: string }
  | { kind: 'bold'; value: string }
  | { kind: 'code'; value: string }
const INLINE_CODE = /`([^`]+)`/g
const INLINE_BOLD = /\*\*([^*]+)\*\*/g
function tokenizeInline(source: string): Segment[] {
  const segments: Segment[] = []
  const codeSpans: Array<[number, number, string]> = []
  let match: RegExpExecArray | null
  INLINE_CODE.lastIndex = 0
  while ((match = INLINE_CODE.exec(source)) !== null) {
    codeSpans.push([match.index, match.index + match[0].length, match[1]])
  }
  const extractBold = (from: number, to: number): Segment[] => {
    const chunk = source.slice(from, to)
    const result: Segment[] = []
    let cursor = 0
    INLINE_BOLD.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = INLINE_BOLD.exec(chunk)) !== null) {
      if (m.index > cursor) result.push({ kind: 'plain', value: chunk.slice(cursor, m.index) })
      result.push({ kind: 'bold', value: m[1] })
      cursor = m.index + m[0].length
    }
    if (cursor < chunk.length) result.push({ kind: 'plain', value: chunk.slice(cursor) })
    if (result.length === 0) result.push({ kind: 'plain', value: '' })
    return result
  }
  let lastIndex = 0
  for (const [start, end, content] of codeSpans) {
    if (start > lastIndex) segments.push(...extractBold(lastIndex, start))
    segments.push({ kind: 'code', value: content })
    lastIndex = end
  }
  if (lastIndex < source.length) segments.push(...extractBold(lastIndex, source.length))
  return segments
}
const LIST_LINE = /^( *)(-|\d+\.) (.*)$/

/**
 * 渲染一行内联片段（**bold** / `code` / 纯文本）。
 */
function renderSegments(key: string, segments: readonly Segment[]): React.ReactNode {
  return segments.map((s, i) => {
    const k = `${key}-${i}`
    if (s.kind === 'bold') {
      return (
        <ThemedText key={k} color="claude" bold>
          {s.value}
        </ThemedText>
      )
    }
    if (s.kind === 'code') {
      return (
        <ThemedText key={k} color="syntaxString" backgroundColor="toolCardBackground">
          {' ' + s.value + ' '}
        </ThemedText>
      )
    }
    return (
      <ThemedText key={k} color="text">
        {s.value}
      </ThemedText>
    )
  })
}

/**
 * 助手消息（对齐原版 deepseek-tui 的 "Assistant" 标签）：
 *   ● Assistant  {首行}
 *                {续行/列表，统一缩进}
 * 行内支持 **bold**、`code`；行首 "- " / "1. " 触发列表缩进。
 */
function AssistantMessage({ text }: AssistantMessageProps): React.ReactElement {
  const lines = text.split('\n')
  return (
    <ThemedBox flexDirection="row" marginTop={1} alignItems="flex-start">
      <ThemedBox width={2} flexShrink={0} alignItems="flex-start">
        <ThemedText color="briefLabelClaude" bold>
          ●
        </ThemedText>
      </ThemedBox>
      <ThemedBox flexDirection="column" flexGrow={1} paddingRight={1} minWidth={0}>
        {/* 首行：Assistant 标签 + 首行内容 */}
        <ThemedBox flexDirection="row" alignItems="flex-start" flexShrink={0}>
          <ThemedText color="briefLabelClaude" bold wrap="truncate">
            Assistant
          </ThemedText>
          <ThemedBox marginLeft={1} flexGrow={1} minWidth={0}>
            <ThemedText color="text" wrap="wrap">
              {lines[0] ? renderSegments('a0', tokenizeInline(lines[0])) : ' '}
            </ThemedText>
          </ThemedBox>
        </ThemedBox>
        {/* 续行：列表缩进 / 普通行 */}
        {lines.slice(1).map((line, idx) => {
          const key = idx + 1
          const listMatch = LIST_LINE.exec(line)
          if (listMatch) {
            const [, indent, marker, content] = listMatch
            const spaces = indent ? indent.length : 0
            // 内容列起点对齐到 "Assistant " 之后的正文列（9 字标签 + 1 空格）
            const indentCols = 10 + spaces * 2
            return (
              <ThemedBox key={key} flexDirection="row" flexShrink={0}>
                <ThemedBox width={indentCols} flexShrink={0}>
                  <ThemedText dimColor>{marker + ' '}</ThemedText>
                </ThemedBox>
                <ThemedBox flexGrow={1} minWidth={0}>
                  <ThemedText color="text" wrap="wrap">
                    {renderSegments(`a${key}-l`, tokenizeInline(content))}
                  </ThemedText>
                </ThemedBox>
              </ThemedBox>
            )
          }
          return (
            <ThemedText key={key} color="text" wrap="wrap">
              {renderSegments(`a${key}`, tokenizeInline(line))}
            </ThemedText>
          )
        })}
      </ThemedBox>
    </ThemedBox>
  )
}
export default AssistantMessage
