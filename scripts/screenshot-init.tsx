import React from 'react'
import { render } from 'ink'
import { Readable, Writable } from 'node:stream'
import { writeFileSync } from 'node:fs'
import App from '../src/App'
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
const cols = Number(process.argv[2] ?? 100)
const rows = Number(process.argv[3] ?? 30)
const outfile = process.argv[4] ?? 'scripts/screen-init.txt'
try {
  Object.defineProperty(process.stdout, 'rows', { value: rows, configurable: true, writable: true })
  Object.defineProperty(process.stdout, 'columns', { value: cols, configurable: true, writable: true })
} catch {}
const stdin = new Readable({ read() {} }) as any
stdin.isTTY = true
stdin.setRawMode = function () { return this }
stdin.setEncoding = function () { return this }
stdin.resume = function () { return this }
stdin.pause = function () { return this }
stdin.ref = function () { return this }
stdin.unref = function () { return this }
const chunks: Buffer[] = []
const stdout = new Writable({ write(c: any, _e: any, cb: () => void) { chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)); cb() } }) as any
stdout.columns = cols
stdout.rows = rows
const inst = render(React.createElement(App), { stdin, stdout, exitOnCtrlC: false, debug: false, patchConsole: false })
function strip(s: string) { return s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\r/g, '') }
async function main() {
  await sleep(1800)
  const raw = Buffer.concat(chunks).toString('utf8')
  const parts = raw.split(/\x1b\[2J\x1b\[3J\x1b\[H|\x1b\[2J/)
  const lastFrame = parts[parts.length - 1] || raw
  const screen = strip(lastFrame).split('\n').slice(-rows).join('\n')
  writeFileSync(outfile, screen)
  console.log(`wrote ${outfile}`)
  inst.unmount(); process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
