# zhihu-cli

知乎 CLI - 通过命令行搜索、阅读知乎内容。

## 特性

- 🔍 搜索知乎内容
- 🔥 获取热榜
- 📖 读取回答/文章
- 💬 获取评论
- 👤 查看用户信息
- 👍 点赞/取消点赞
- 🔖 收藏管理

## 安装

```bash
npm install -g zhihu-cli
```

或通过 ClawHub（OpenClaw 生态）：

```bash
clawhub install zhihu
```

需要 Node.js >= 18。

## 快速开始

1. 安装后运行 `zhihu whoami` 检查连接
2. 设置 Cookie（见下方）
3. 开始使用！

## Cookie 设置

### 方式一：命令行输入

```bash
zhihu set-cookie "z_c0=xxx;d_c0=xxx;..."
```

### 方式二：配置文件

获取 Cookie：
1. 浏览器登录知乎
2. F12 → Application → Cookies → zhihu.com
3. 复制 `z_c0` 的 Value

写入配置文件：
- Windows: `%USERPROFILE%\.zhihu-cookies`
- Linux/Mac: `~/.zhihu-cookies`

## 命令

| 命令 | 说明 |
|------|------|
| `zhihu whoami` | 检查登录状态 |
| `zhihu hot` | 获取热榜 |
| `zhihu search <关键词>` | 搜索内容 |
| `zhihu topics <关键词>` | 搜索话题 |
| `zhihu read <链接>` | 读取回答/文章 |
| `zhihu comments <链接>` | 获取评论 |
| `zhihu user <token>` | 查看用户 |
| `zhihu vote <链接>` | 点赞 |
| `zhihu unvote <链接>` | 取消点赞 |

## 选项

### search
- `-s, --sort <type>` - 排序方式 (general/popular/latest)

### comments
- `-l, --limit <number>` - 评论数量

## AI 助手使用

把这段话发给 AI 助手：

> "帮我用 npm 安装 zhihu-cli 这个知乎 CLI 工具，然后运行 zhihu hot 看看热榜。"

## 与 AI Agent 集成

可以作为库导入使用：

```javascript
import { search, hot, read } from 'zhihu-cli';

const results = await search('关键词');
```

## License

MIT
