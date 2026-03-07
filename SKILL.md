# zhihu-cli

知乎 CLI - 通过命令行搜索、阅读知乎内容。

## 描述

一个类似 redbook CLI 的知乎命令行工具，支持搜索、热榜、读取内容、评论等功能。

## 能力

- 搜索知乎内容
- 获取热榜
- 读取回答/文章
- 获取评论
- 查看用户信息
- 点赞/取消点赞

## 安装

```bash
npm install -g zhihu-cli
# 或通过 ClawHub
clawhub install zhihu
```

## 使用方法

### 命令行

```bash
# 检查登录状态
zhihu whoami

# 设置 Cookie
zhihu set-cookie "<cookie>"

# 获取热榜
zhihu hot

# 搜索内容
zhihu search "关键词"

# 搜索话题
zhihu topics "话题"

# 读取回答
zhihu read <知乎链接>

# 获取评论
zhihu comments <链接>

# 查看用户
zhihu user <用户ID或链接>

# 点赞
zhihu vote <回答链接>
```

### AI 助手使用

把这段话发给 AI 助手：

"帮我用 npm 安装 zhihu-cli 这个知乎 CLI 工具，然后运行 zhihu hot 看看热榜。GitHub 地址：https://github.com/yourname/zhihu-cli"

## Cookie 设置

### 方式一：对话输入

发给我：`我的cookie是: <z_c0的完整值>`

我会自动保存到 `~/.openclaw/.zhihu-cookies`

### 方式二：手动写入

1. 浏览器登录知乎
2. F12 → Application → Cookies → zhihu.com
3. 复制 `z_c0` 的 Value
4. 写入配置文件：
   - Windows: `C:\Users\<用户名>\.openclaw\.zhihu-cookies`
   - Linux/Mac: `~/.openclaw/.zhihu-cookies`

## 示例

```
zhihu search "AI编程"
zhihu hot
zhihu read https://www.zhihu.com/answer/123456
```
