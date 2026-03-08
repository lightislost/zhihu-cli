# zhihu-cli

知乎 CLI - 搜索、阅读、发帖。

## 描述

知乎命令行工具，支持两种认证方式：
1. Cookie 认证 - 适合命令行搜索、读取
2. Browser Relay - 适合自动发帖（推荐）

## 能力

- 搜索知乎内容
- 获取热榜
- 读取回答/文章
- 获取评论
- 查看用户信息
- 点赞/取消点赞
- 浏览器发帖（通过 OpenClaw Browser Relay）

## 安装

```bash
npm install -g zhihu-cli
```

## 使用方法

### 命令行

```bash
# 自动登录（从 Chrome 提取 Cookie）
zhihu login

# 检查登录
zhihu whoami

# 设置 Cookie
zhihu set-cookie "<cookie>"

# 获取热榜
zhihu hot

# 搜索
zhihu search "关键词"

# 发帖（Browser Relay）
zhihu post
```

### AI Agent 使用

通过 OpenClaw 直接语音/文字控制：
- "帮我搜索知乎上的 AI 教程"
- "获取今天的热榜"
- "发一个知乎想法：测试内容"

## Cookie 设置

### 方式一：命令行自动

```bash
zhihu login
```
需要安装 browser-cookie3: `pip install browser-cookie3`

### 方式二：手动

- Windows: `C:\Users\<用户名>\.openclaw\.zhihu-cookies`
- Linux/Mac: `~/.openclaw/.zhihu-cookies`

获取方式：
1. 浏览器登录知乎
2. F12 → Application → Cookies → zhihu.com
3. 复制 `z_c0` 的 Value

## Browser Relay 发帖实现

知乎使用 Draft.js 编辑器，需使用以下方式触发输入：

```javascript
const el = document.querySelector('[contenteditable="true"]');
el.focus();
document.execCommand('selectAll');
document.execCommand('insertText', false, '你的内容');
```

## 认证方式对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| Cookie | 快速、命令行可用 | 需手动复制 |
| Browser Relay | 无需手动复制、可视化 | 需保持浏览器在线 |

## 依赖

- Node.js >= 18
- browser-cookie3 (可选)
- OpenClaw（Browser Relay 方式）

## License

MIT
