// scripts/tab-harness.tsx — verify tab toggles thinking collapse (visible effect).
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
function findThinking(lines: string[]): string {
  const t = lines.find(l => l.includes('thinking'))
  return t ? t.trim() : '(thinking line not in top frame)'
}
async function main() {
  await sleep(900)
  const first = strip(Buffer.concat(chunks).toString('utf8')).split('\n')
  console.log('state A (default collapsed):', findThinking(first))

  // clear chunks, tab once
  chunks.length = 0
  stdin.push(Buffer.from('\t')); await sleep(200)
  const second = strip(Buffer.concat(chunks).toString('utf8')).split('\n')
  console.log('state B (after tab):', findThinking(second))

  chunks.length = 0
  stdin.push(Buffer.from('\t')); await sleep(200)
  const third = strip(Buffer.concat(chunks).toString('utf8')).split('\n')
  console.log('state C (after tab again):', findThinking(third))
  inst.unmount()
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
