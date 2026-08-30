// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react'
import ThemedBox from './design-system/ThemedBox'
import ThemedText from './design-system/ThemedText'
import SidebarPanel from './SidebarPanel'

// Agent 状态类型
type AgentStatus = 'idle' | 'thinking' | 'running' | 'done'

// 工具调用记录
interface ToolCall {
  id: string
  name: string
  status: 'pending' | 'running' | 'done' | 'error'
  result?: string
  timestamp: number
}

/**
 * 右侧边栏：显示 Agent 状态和工具调用过程
 */
function Sidebar(): React.ReactElement {
  // Agent 状态
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle')
  const [agentMessage, setAgentMessage] = useState('')
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([])

  // 模拟 Agent 思考和工具调用过程
  useEffect(() => {
    const messages = [
      { status: 'thinking', msg: 'Analyzing user request...' },
      { status: 'thinking', msg: 'Identifying task scope...' },
      { status: 'running', msg: 'Planning code changes...' },
      { status: 'running', msg: 'Executing plan...' },
      { status: 'done', msg: 'Task completed successfully' },
    ]

    const tools: ToolCall[] = [
      { id: '1', name: 'read_file', status: 'pending', timestamp: Date.now() },
      { id: '2', name: 'search_code', status: 'pending', timestamp: Date.now() },
      { id: '3', name: 'write_file', status: 'pending', timestamp: Date.now() },
    ]

    // 模拟 Agent 状态变化
    messages.forEach((item, index) => {
      setTimeout(() => {
        setAgentStatus(item.status as AgentStatus)
        setAgentMessage(item.msg)

        // 当进入 running 状态时，开始执行工具
        if (item.status === 'running') {
          // 逐个执行工具
          tools.forEach((tool, tIdx) => {
            setTimeout(() => {
              setToolCalls(prev => {
                const updated = [...prev]
                const existing = updated.find(t => t.id === tool.id)
                if (existing) {
                  existing.status = 'running'
                } else {
                  updated.push({ ...tool, status: 'running' })
                }
                return updated
              })

              // 模拟工具完成
              setTimeout(() => {
                setToolCalls(prev => {
                  const updated = [...prev]
                  const existing = updated.find(t => t.id === tool.id)
                  if (existing) {
                    existing.status = 'done'
                    existing.result = tIdx === 0 ? 'Found 3 relevant files' :
                                     tIdx === 1 ? 'Found 12 matches' : 'Updated 2 files'
                  }
                  return updated
                })
              }, 800 + tIdx * 400)
            }, 500 + tIdx * 600)
          })
        }
      }, index * 800)
    })
  }, [])

  // 渲染 Agent 状态
  const renderAgentStatus = () => {
    const statusMap = {
      idle: { icon: '·', color: 'inactive', label: 'Idle' },
      thinking: { icon: '⠋', color: 'claudeBlue_FOR_SYSTEM_SPINNER', label: 'Thinking' },
      running: { icon: '▶', color: 'claude', label: 'Running' },
      done: { icon: '●', color: 'success', label: 'Done' },
    }

    const current = statusMap[agentStatus] || statusMap.idle

    return (
      <ThemedBox flexDirection="column" flexShrink={0}>
        <ThemedBox flexDirection="row" alignItems="center" flexShrink={0}>
          <ThemedText color={current.color as any}>{current.icon}</ThemedText>
          <ThemedText color="text" bold>
            {' '}{current.label}
          </ThemedText>
        </ThemedBox>
        {agentStatus === 'thinking' && (
          <ThemedBox paddingLeft={2} marginTop={0}>
            <ThemedText dimColor wrap="truncate">
              {agentMessage}
            </ThemedText>
          </ThemedBox>
        )}
        {agentStatus === 'running' && (
          <ThemedBox flexDirection="column" paddingLeft={2} marginTop={0}>
            <ThemedText dimColor wrap="truncate">
              {agentMessage}
            </ThemedText>
            <ThemedBox flexDirection="row" alignItems="center" marginTop={0}>
              <ThemedText color="claude">━━━━</ThemedText>
              <ThemedText dimColor>━━━━</ThemedText>
              <ThemedText dimColor>━━━━</ThemedText>
            </ThemedBox>
          </ThemedBox>
        )}
        {agentStatus === 'done' && (
          <ThemedBox paddingLeft={2} marginTop={0}>
            <ThemedText color="success" wrap="truncate">
              ✓ {agentMessage}
            </ThemedText>
          </ThemedBox>
        )}
      </ThemedBox>
    )
  }

  // 渲染工具调用
  const renderToolCalls = () => {
    const statusIconMap = {
      pending: { icon: '·', color: 'inactive' },
      running: { icon: '⠋', color: 'claudeBlue_FOR_SYSTEM_SPINNER' },
      done: { icon: '✔', color: 'success' },
      error: { icon: '✗', color: 'error' },
    }

    return (
      <ThemedBox flexDirection="column" flexShrink={0}>
        {toolCalls.length === 0 ? (
          <ThemedText dimColor>No tool calls</ThemedText>
        ) : (
          toolCalls.map((call) => {
            const status = statusIconMap[call.status] || statusIconMap.pending
            return (
              <ThemedBox key={call.id} flexDirection="column" marginBottom={0}>
                <ThemedBox flexDirection="row" alignItems="center" flexShrink={0}>
                  <ThemedText color={status.color as any}>{status.icon}</ThemedText>
                  <ThemedText color="text">
                    {' '}{call.name}
                  </ThemedText>
                  <ThemedText dimColor>
                    {'  '}
                    {call.status === 'pending' && 'waiting...'}
                    {call.status === 'running' && 'executing...'}
                    {call.status === 'done' && 'done'}
                    {call.status === 'error' && 'failed'}
                  </ThemedText>
                </ThemedBox>
                {call.result && (
                  <ThemedBox paddingLeft={2} marginTop={0}>
                    <ThemedText dimColor wrap="truncate">
                      → {call.result}
                    </ThemedText>
                  </ThemedBox>
                )}
              </ThemedBox>
            )
          })
        )}
      </ThemedBox>
    )
  }

  return (
    <ThemedBox
      width="30%"
      flexDirection="column"
      paddingLeft={1}
      paddingRight={1}
      paddingTop={1}
      flexShrink={0}
      minWidth={0}
    >
      {/* Agent 面板 */}
      <SidebarPanel title="Agent">
        {renderAgentStatus()}
      </SidebarPanel>

      {/* Tools 面板 */}
      <SidebarPanel title="Tools">
        {renderToolCalls()}
      </SidebarPanel>
    </ThemedBox>
  )
}

export default Sidebar