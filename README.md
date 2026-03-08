# zhihu-cli

知乎 CLI - 通过命令行搜索、阅读知乎内容。

## 特性

- 🔍 搜索知乎内容
- 🔥 获取热榜
- 📖 读取回答/文章
- 💬 获取评论
- 👤 查看用户信息
- 👍 点赞/取消点赞

## 安装

```bash
npm install -g zhihu-cli
```

需要 Node.js >= 18。

## 快速开始

1. 安装后运行 `zhihu whoami` 检查连接
2. 设置 Cookie（见下方）
3. 开始使用！

## 两种认证方式

### 方式一：Cookie 认证

适合命令行使用，快速便捷：

```bash
# 自动提取（需要当前用户登录过 Chrome）
zhihu login

# 手动设置
zhihu set-cookie "z_c0=xxx;d_c0=xxx;..."
```

⚠️ **自动提取限制**：需要用当前系统用户登录过 Chrome，否则会报错 "Unable to get key for cookie decryption"。手动复制 Cookie 仍然可用。

### 方式二：Browser Relay（发帖功能）

适合自动化发帖，无需手动复制 Cookie：

1. 安装 OpenClaw 扩展
2. 在知乎页面点击扩展图标连接
3. 直接通过语音/文字让 AI 帮你发帖

**Browser Relay 发帖实现**：
```javascript
// 关键：使用 execCommand 触发 Draft.js 输入事件
const el = document.querySelector('[contenteditable="true"]');
el.focus();
document.execCommand('insertText', false, '你的内容');
```

## Cookie 配置文件路径

**重要**：手动存放 Cookie 时，请存放到以下路径：

| 系统 | 路径 |
|------|------|
| Windows | `C:\Users\<用户名>\.openclaw\.zhihu-cookies` |
| Linux/Mac | `~/.openclaw/.zhihu-cookies` |

获取方式：
1. 浏览器登录知乎
2. F12 → Application → Cookies → zhihu.com
3. 复制 `z_c0` 的 Value

## 命令

| 命令 | 说明 |
|------|------|
| `zhihu login` | 自动从 Chrome 提取 Cookie |
| `zhihu whoami` | 检查登录状态 |
| `zhihu set-cookie <cookie>` | 手动设置 Cookie |
| `zhihu hot` | 获取热榜 |
| `zhihu search <关键词>` | 搜索内容 |
| `zhihu topics <关键词>` | 搜索话题 |
| `zhihu read <链接>` | 读取回答/文章 |
| `zhihu user <token>` | 查看用户 |
| `zhihu vote <链接>` | 点赞 |
| `zhihu unvote <链接>` | 取消点赞 |

## 认证方式对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| Cookie | 快速、命令行可用 | 需手动复制 |
| Browser Relay | 无需手动复制、可视化 | 需保持浏览器在线 |

## 依赖

- Node.js >= 18
- browser-cookie3 (自动提取 Cookie)
- OpenClaw（Browser Relay 方式）

## License

MIT
