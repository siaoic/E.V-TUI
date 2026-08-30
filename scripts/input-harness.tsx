// scripts/input-harness.tsx — verify text input handling end-to-end with
// controlled key events, and capture rendered frames at each step.
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
stdout.columns = Number(process.env.COLUMNS ?? 100)
stdout.rows = Number(process.env.LINES ?? 30)

const inst = render(React.createElement(App), {
  stdin,
  stdout,
  exitOnCtrlC: false,
  debug: false,
  patchConsole: false,
})

function strip(s: string): string {
  return s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\r/g, '')
}
function snapshot(label: string) {
  const out = Buffer.concat(chunks).toString('utf8')
  const lines = strip(out).split('\n').filter(l => l.trim().length > 0)
  console.log(`\n===== ${label} =====`)
  // show only Composer region: find the last occurrence of the input box
  const idx = lines.length
  console.log(lines.slice(idx - 10).join('\n'))
}

async function main() {
  await sleep(800) // initial render + fit settle
  snapshot('initial')

  for (const ch of 'hello') {
    stdin.push(Buffer.from(ch, 'utf8'))
    await sleep(40)
  }
  await sleep(150)
  snapshot('after typing "hello"')

  // backspace x2
  stdin.push(Buffer.from([0x7f]))
  await sleep(60)
  stdin.push(Buffer.from([0x7f]))
  await sleep(120)
  snapshot('after 2 backspaces')

  // left arrow (should not affect text)
  stdin.push(Buffer.from('\x1b[D'))
  await sleep(60)
  snapshot('after left-arrow')

  // type one char (inserts at cursor)
  stdin.push(Buffer.from('X', 'utf8'))
  await sleep(120)
  snapshot('after X')

  // enter -> submits
  stdin.push(Buffer.from('\r'))
  await sleep(200)
  snapshot('after enter (submitted)')

  // ctrl+c
  inst.unmount()
  const out = Buffer.concat(chunks).toString('utf8')
  const s = strip(out)
  const headerCount = (s.match(/✦ Agent/g) || []).length
  console.log('\nheader count (should be ~1):', headerCount)
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
