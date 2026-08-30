import React from 'react'
import { render, type Instance } from 'ink'
import App from './src/App'

// -----------------------------------------------------------------------------
// FIX-A（H2 假设）：使用 Alternate Screen Buffer（DECSET 1049）取代手写 ANSI 清屏
//
// 背景：Ink 内部用 log-update 做「先把光标移到首帧位置，再覆盖 N 行」的增量渲染。
//       若在 render() 之前直接 stdout.write('\u001b[2J\u001b[0;0H') 清屏并移动
//       光标到 (0,0)，log-update 保存的「首帧之前光标位置」就被悄悄污染，第一次
//       setState 触发第二次整帧绘制时，光标 UP 的偏移计算错误，第二帧会直接
//       追加在第一帧下方 → 就是用户反馈的「双帧堆叠」。
//
// 解决：
//   进入时切换到终端的备用屏幕缓冲区 (\x1b[?1049h)，缓冲区独立于 shell 滚动回
//   看，光标初始位置一定是 (0,0) 且和主线 shell 互不干扰；退出时切回主屏幕
//   (\x1b[?1049l)，自动恢复用户之前 shell 的内容，这也是 vim / htop / less 等
//   正统 TUI 程序的标准做法。
// -----------------------------------------------------------------------------
const ENTER_ALT_SCREEN = '\x1b[?1049h'
const LEAVE_ALT_SCREEN = '\x1b[?1049l'
const SHOW_CURSOR      = '\x1b[?25h'

function writeIfTty(s: string) {
  if (process.stdout && typeof process.stdout.write === 'function') {
    try { process.stdout.write(s) } catch { /* ignore */ }
  }
}

writeIfTty(ENTER_ALT_SCREEN)

const teardown = () => {
  // 先回到主屏幕 + 恢复光标，再 unmount Ink，避免残影或把错误布局写回主屏幕
  writeIfTty(LEAVE_ALT_SCREEN + SHOW_CURSOR)
}

let inkInstance: Instance | undefined

const onExit = () => {
  try {
    if (inkInstance) inkInstance.unmount()
  } finally {
    teardown()
  }
}

process.on('exit', onExit)
process.on('SIGINT', () => { onExit(); process.exit(130) })
process.on('SIGTERM', () => { onExit(); process.exit(143) })
process.on('uncaughtException', () => { onExit(); process.exit(1) })

inkInstance = render(React.createElement(App), { exitOnCtrlC: true })

// 渲染完成后也调用一次内置 clear 作为 H2 的额外防线（把 log-update 首帧之前的
// 空白残留清掉）；render 立即返回所以这里执行实际上在首帧 emit 之前，无副作用。
try { inkInstance.clear() } catch { /* ignore */ }
