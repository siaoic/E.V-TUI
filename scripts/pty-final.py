#!/usr/bin/env python3
"""Final PTY verification with generous init time and proper typing."""
import os, pty, sys, time, select, signal, fcntl, termios, struct

def set_winsize(fd, cols, rows):
    fcntl.ioctl(fd, termios.TIOCSWINSZ, struct.pack('HHHH', rows, cols, 0, 0))

def run(cols=100, rows=30):
    pid, fd = pty.fork()
    if pid == 0:
        os.environ['COLUMNS'] = str(cols)
        os.environ['LINES'] = str(rows)
        os.environ['FORCE_COLOR'] = '1'
        os.environ.pop('CI', None)
        os.chdir('/home/user/.super_doubao/super-doubao-runtime/workspace/deepseek-tui-ts')
        os.execv('./node_modules/.bin/tsx', ['./node_modules/.bin/tsx', 'index.tsx'])
    set_winsize(fd, cols, rows)
    buf = b''
    def drain(timeout):
        nonlocal buf
        end = time.time() + timeout
        while time.time() < end:
            r, _, _ = select.select([fd], [], [], 0.05)
            if r:
                try:
                    data = os.read(fd, 65536)
                except OSError:
                    return
                if not data:
                    return
                buf += data
            else:
                time.sleep(0.02)
    print("waiting for init (slow WASM)...")
    drain(22)  # generous init
    print("init done, bytes:", len(buf))
    # Now type slowly with gaps to ensure each char is processed
    for ch in 'Hi there':
        os.write(fd, ch.encode())
        drain(0.3)
    drain(0.5)
    print("after typing, bytes:", len(buf))
    # enter to send
    os.write(fd, b'\r')
    drain(0.6)
    print("after enter, bytes:", len(buf))
    # send another short message
    for ch in 'ok':
        os.write(fd, ch.encode())
        drain(0.25)
    os.write(fd, b'\r')
    drain(0.6)
    print("after 2nd send, bytes:", len(buf))
    os.write(fd, b'\x03')
    drain(0.5)
    try: os.kill(pid, signal.SIGKILL)
    except: pass
    os.close(fd)
    # Render the FINAL terminal screen: take the tail (last ~7000 bytes)
    with open('scripts/pty-final2.bin', 'wb') as f:
        f.write(buf)
    print("TOTAL bytes:", len(buf))
    # Show the tail as the "screen"
    tail = buf[-7000:]
    sys.stdout.write(tail.decode('utf-8', 'replace').replace('\x1b', '␛'))
    print("\n=====END=====")

if __name__ == '__main__':
    run()
