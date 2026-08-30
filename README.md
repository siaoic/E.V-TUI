# DeepSeek TUI (TypeScript / Ink)

基于 [adrianlerer/deepseek-tui](https://github.com/adrianlerer/deepseek-tui) 参考重构的
TypeScript + [Ink](https://github.com/vadimdemedes/ink) 终端 UI 版本，用于演示 DeepSeek
编码 Agent 的对话界面。

## 运行

```bash
npm install
npm start          # 等价于 tsx index.tsx
```

建议在支持真彩色的现代终端（如 iTerm2、Windows Terminal、GNOME Terminal）中运行。

## 交互

| 按键 | 作用 |
| --- | --- |
| 普通字符 | 输入到 Composer |
| `←` / `→` | 在输入框内移动光标 |
| `Backspace` / `Delete` | 删除光标前/后字符 |
| `Enter` | 发送当前输入 |
| `↑` / `↓` | 在对话区回看/回到最新消息（有历史时） |
| `Tab` | 展开 / 折叠 thinking 推理块 |
| `Ctrl+C` | 退出（恢复终端主屏幕） |

## 本次重构修复的问题

1. **Composer 输入错位 / 输入失效**
   - 旧实现手写 `process.stdin` 监听 + `setRawMode`，与 Ink 自身的 `useInput`
     抢事件，首次按键后会把 raw mode 关掉，导致后续输入失效、文字错乱。
   - 现在改用 `ink-text-input`（Ink 统一管理 raw mode / 光标 / 焦点），正确支持
     退格、左右移动光标、中间插入、Enter 提交与占位文案。

2. **对话内容溢出到输入框 / Footer（视觉错位）**
   - Ink 不会裁剪子内容：旧布局把整段对话塞进 `flexGrow` 区域，内容超高后直接
     盖到 Composer 与状态栏上。
   - 新增 `MessageList`：用 `measureElement` 实测渲染高度，自动裁剪可见消息数，
     从最新一条贴底填充，溢出内容只发生在对话区内部；`↑ / ↓` 可回看更早消息。

3. **布局固定分区**
   - Header / Body / Composer / Footer 高度精确分配，互不挤压；
   - Composer 与 Footer 均为固定高度、不参与收缩。

4. **美化（对齐原版设计）**
   - Composer 输入气泡带 "Composer" 标签与占位文案 `Write a task or use /.`；
   - 助手消息增加 "Assistant" 标签，列表项与续行对齐；
   - Header 显示 `✦ Agent <agent> · <model>`，右侧 effort / ctx；
   - 保持雾蓝（Gentle Mist Blue）双主题（dark / light）设计体系。

## 设计系统

- `src/theme.ts`：dark / light 两套主题调色板与语义色解析。
- `src/components/design-system/`：`ThemedBox` / `ThemedText` / `Divider` / `Pane` /
  `StatusIcon` 等主题感知基础组件。

## 验证脚本（scripts/）

- `input-harness.tsx`：模拟按键，验证输入 / 退格 / 光标 / 提交。
- `scroll-harness.tsx`：验证 `↑ / ↓` 滚动。
- `tab-harness.tsx`：验证 `Tab` 折叠 thinking。
- `double-frame-harness.mjs`：检测「双帧堆叠」回归（应输出 GREEN）。
- `pty-final.py`：在真实 PTY 中运行并模拟输入，抓取终端原始输出。
- `screenshot.tsx` / `screenshot-init.tsx`：把最终界面渲染为纯文本快照。

```bash
npx tsx scripts/input-harness.tsx
npx tsx scripts/scroll-harness.tsx
npx tsx scripts/tab-harness.tsx
node scripts/double-frame-harness.mjs
python3 scripts/pty-final.py
npx tsx scripts/screenshot.tsx 100 30 scripts/screen.txt
```
