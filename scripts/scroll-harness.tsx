// scripts/scroll-harness.tsx — verify ↑/↓ scroll + tab toggle work.
import React from 'react'
import { render } from 'ink'
import { Readable, Writable } from 'node:stream'
import App from '../src/App'

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
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
stdout.columns = 100
stdout.rows = 30
const inst = render(React.createElement(App), {
  stdin, stdout, exitOnCtrlC: false, debug: false, patchConsole: false,
})
function strip(s: string): string {
  return s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\r/g, '')
}
function lastFrame() {
  const out = Buffer.concat(chunks).toString('utf8')
  const lines = strip(out).split('\n')
  return lines.filter(l => l.trim().length > 0).slice(-14)
}
function snapshot(label: string) {
  console.log(`\n===== ${label} =====`)
  console.log(lastFrame().join('\n'))
}
async function send(text: string) {
  for (const ch of text) { stdin.push(Buffer.from(ch, 'utf8')); await sleep(25) }
  stdin.push(Buffer.from('\r')); await sleep(150)
}
async function main() {
  await sleep(900)
  snapshot('initial')
  await send('msg-one')
  snapshot('after send msg-one')
  await send('msg-two')
  snapshot('after send msg-two')
  // scroll up twice (older)
  stdin.push(Buffer.from('\x1b[A')); await sleep(120)
  snapshot('after up-arrow #1')
  stdin.push(Buffer.from('\x1b[A')); await sleep(120)
  snapshot('after up-arrow #2')
  // scroll down to newest
  stdin.push(Buffer.from('\x1b[B')); await sleep(120)
  stdin.push(Buffer.from('\x1b[B')); await sleep(150)
  snapshot('after down-arrow x2')
  // tab toggles thinking
  stdin.push(Buffer.from('\t')); await sleep(150)
  snapshot('after tab (thinking expanded)')
  stdin.push(Buffer.from('\t')); await sleep(150)
  inst.unmount()
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
