import React from 'react'
import ThemedBox from './design-system/ThemedBox'
import ThemedText from './design-system/ThemedText'

export type UserMessageProps = {
  /** 用户消息纯文本；按 \n 分行显示。 */
  readonly text: string
}

/**
 * 用户消息：一行 "You" 金色徽章 + 背景色块包裹正文。
 * 正文相对徽章自动换行并保持缩进对齐。
 */
function UserMessage({ text }: UserMessageProps): React.ReactElement {
  const lines = text.split('\n')
  return (
    <ThemedBox
      flexDirection="column"
      marginTop={1}
      paddingX={1}
      paddingTop={1}
      paddingBottom={1}
      backgroundColor="userMessageBackground"
    >
      <ThemedBox flexDirection="row" alignItems="center" flexShrink={0}>
        <ThemedBox
          paddingX={1}
          backgroundColor="briefLabelYou"
          marginRight={1}
          flexShrink={0}
        >
          <ThemedText color="inverseText" bold>
            You
          </ThemedText>
        </ThemedBox>
        <ThemedBox flexGrow={1} flexShrink={1} minWidth={0}>
          <ThemedText color="text" wrap="wrap">
            {lines[0] ?? ' '}
          </ThemedText>
        </ThemedBox>
      </ThemedBox>
      {lines.slice(1).map((line, i) => (
        <ThemedBox key={i} paddingLeft={6} flexShrink={0}>
          <ThemedText color="text" wrap="wrap">
            {line || ' '}
          </ThemedText>
        </ThemedBox>
      ))}
    </ThemedBox>
  )
}

export default UserMessage
