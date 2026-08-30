// scripts/screenshot.tsx — render App and dump the final screen as clean text.
// Usage: npx tsx scripts/screenshot.tsx [cols] [rows] [outfile]
import React from 'react'
import { render } from 'ink'
import { Readable, Writable } from 'node:stream'
import { writeFileSync } from 'node:fs'
import App from '../src/App'

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
const cols = Number(process.argv[2] ?? 100)
const rows = Number(process.argv[3] ?? 30)
const outfile = process.argv[4] ?? 'scripts/screen.txt'

// App 读取 process.stdout.rows/columns 计算布局；非 TTY 时该值是 undefined，
// 这里补上，让截图与真实终端尺寸一致。
try {
  Object.defineProperty(process.stdout, 'rows', { value: rows, configurable: true, writable: true })
  Object.defineProperty(process.stdout, 'columns', { value: cols, configurable: true, writable: true })
} catch { /* ignore */ }

const stdin = new Readable({ read() {} }) as any
stdin.isTTY = true
stdin.setRawMode = function () { return this }
stdin.setEncoding = function () { return this }
stdin.resume = function () { return this }
stdin.pause = function () { return this }
stdin.ref = function () { return this }
stdin.unref = function () { return this }
const chunks: Buffer[] = []
const stdout = new Writable({
  write(c: any, _e: any, cb: () => void) {
    chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c))
    cb()
  },
}) as any
stdout.columns = cols
stdout.rows = rows
const inst = render(React.createElement(App), {
  stdin, stdout, exitOnCtrlC: false, debug: false, patchConsole: false,
})
function strip(s: string): string {
  return s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\r/g, '')
}
async function main() {
  await sleep(1500)
  // type a message and send it
  for (const ch of 'Refactor the sidebar layout and add icons') {
    stdin.push(Buffer.from(ch, 'utf8')); await sleep(15)
  }
  stdin.push(Buffer.from('\r')); await sleep(400)
  const raw = Buffer.concat(chunks).toString('utf8')
  // 以清屏序列为帧边界，取最后一个完整帧（真实终端会清屏后重绘）
  const parts = raw.split(/\x1b\[2J\x1b\[3J\x1b\[H|\x1b\[2J/)
  const lastFrame = parts[parts.length - 1] || raw
  const out = strip(lastFrame).split('\n')
  const screen = out.slice(-rows).join('\n')
  writeFileSync(outfile, screen)
  console.log(`wrote ${outfile} (${screen.split('\n').length} lines)`)
  inst.unmount()
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
