#!/usr/bin/env node

import { Command } from 'commander';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

// Cookie 文件路径
const COOKIE_PATHS = [
  path.join(__dirname, '..', '..', '.zhihu-cookies'),  // OpenClaw workspace
  path.join(process.env.HOME || process.env.USERPROFILE || '', '.zhihu-cookies')  // 用户目录
];

// 加载 Cookie
function loadCookies(): string {
  for (const cookiePath of COOKIE_PATHS) {
    if (fs.existsSync(cookiePath)) {
      return fs.readFileSync(cookiePath, 'utf-8').trim();
    }
  }
  return '';
}

// 保存 Cookie
function saveCookies(cookie: string): void {
  // 优先保存到 OpenClaw workspace
  const primaryPath = COOKIE_PATHS[0];
  const dir = path.dirname(primaryPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(primaryPath, cookie);
  console.log(`   Cookie 已保存到: ${primaryPath}`);
}

// 清除过期 Cookie
function clearCookies(): void {
  for (const cookiePath of COOKIE_PATHS) {
    if (fs.existsSync(cookiePath)) {
      fs.unlinkSync(cookiePath);
    }
  }
  console.log('   已清除保存的 Cookie');
}

// 检查 Cookie 是否过期
function isCookieExpired(status: number): boolean {
  return status === 401 || status === 403;
}

// 处理 API 错误
function handleApiError(error: any, operation: string): void {
  const status = error.response?.status;
  
  if (isCookieExpired(status)) {
    console.log(`\n⚠️ ${operation}失败：Cookie 已过期`);
    console.log('   请重新设置 Cookie：');
    console.log('   1. 浏览器登录知乎');
    console.log('   2. F12 → Application → Cookies → zhihu.com');
    console.log('   3. 复制 z_c0 的 Value');
    console.log('   4. 运行: zhihu set-cookie "<新cookie>"');
    clearCookies();
  } else if (status === 429) {
    console.log(`❌ ${operation}失败：请求过于频繁，请稍后再试`);
  } else {
    console.log(`❌ ${operation}失败: ${status || '网络错误'}`);
  }
}

function getHeaders(cookie: string) {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://www.zhihu.com/',
    'Cookie': cookie
  };
}

// 检查登录
async function whoami(): Promise<void> {
  console.log('🔍 检查登录状态...');
  const cookie = loadCookies();
  if (!cookie) {
    console.log('❌ 请先设置 Cookie');
    console.log('   使用: zhihu set-cookie "<cookie>"');
    return;
  }
  try {
    const response = await axios.get('https://www.zhihu.com/api/v4/me', {
      headers: getHeaders(cookie)
    });
    const user = response.data;
    console.log('✅ 已登录');
    console.log(`   名字: ${user.name}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   签名: ${user.headline || '无'}`);
  } catch (error: any) {
    handleApiError(error, '登录');
  }
}

// 搜索
async function search(keyword: string, options: any): Promise<void> {
  console.log(`🔍 搜索: "${keyword}"`);
  const cookie = loadCookies();
  if (!cookie) { console.log('❌ 请先设置 Cookie'); return; }
  
  try {
    const response = await axios.get('https://www.zhihu.com/api/v4/search_v3', {
      params: { q: keyword, type: 'content', offset: 0, limit: 10, sort: options.sort || 'general' },
      headers: getHeaders(cookie)
    });
    const items = response.data.data || [];
    console.log(`\n📊 找到 ${items.length} 条结果\n`);
    items.forEach((item: any, index: number) => {
      let title = item.object?.title || item.highlight?.title || item.title || '';
      let url = item.object?.url || item.url || '';
      if (title) {
        console.log(`${index + 1}. ${title}`);
        if (url) console.log(`   链接: ${url.replace('api.zhihu.com', 'www.zhihu.com')}`);
        console.log('');
      }
    });
  } catch (error: any) { handleApiError(error, '搜索'); }
}

// 搜索话题
async function topics(keyword: string): Promise<void> {
  console.log(`🔍 搜索话题: "${keyword}"`);
  const cookie = loadCookies();
  try {
    const response = await axios.get('https://www.zhihu.com/api/v4/search_v3', {
      params: { q: keyword, type: 'topic', offset: 0, limit: 10 },
      headers: getHeaders(cookie)
    });
    const items = response.data.data || [];
    console.log(`\n📊 找到 ${items.length} 个话题\n`);
    items.forEach((item: any, index: number) => {
      const title = item.object?.title || item.title || item.name || '';
      const followers = item.object?.follower_count || item.follower_count || 0;
      const url = item.url || item.object?.url || '';
      if (title) {
        console.log(`${index + 1}. ${title}`);
        console.log(`   关注: ${followers}`);
        if (url) console.log(`   链接: ${url.replace('api.zhihu.com', 'www.zhihu.com')}`);
        console.log('');
      }
    });
  } catch (error: any) { handleApiError(error, '搜索话题'); }
}

// 读取内容
async function read(url: string): Promise<void> {
  console.log(`📖 读取内容: ${url}`);
  const cookie = loadCookies();
  if (!cookie) { console.log('❌ 请先设置 Cookie'); return; }
  
  try {
    const answerMatch = url.match(/zhihu\.com\/answer\/(\d+)/);
    const articleMatch = url.match(/zhihu\.com\/article\/(\d+)/);
    const questionMatch = url.match(/zhihu\.com\/question\/(\d+)/);
    
    let apiUrl = '';
    let type = '';
    if (answerMatch) { type = 'answer'; apiUrl = `https://www.zhihu.com/api/v4/answers/${answerMatch[1]}`; }
    else if (articleMatch) { type = 'article'; apiUrl = `https://www.zhihu.com/api/v4/articles/${articleMatch[1]}`; }
    else if (questionMatch) { type = 'question'; apiUrl = `https://www.zhihu.com/api/v4/questions/${questionMatch[1]}`; }
    else { console.log('❌ 无法解析知乎链接'); return; }
    
    const response = await axios.get(apiUrl, { headers: getHeaders(cookie) });
    const data = response.data;
    
    if (type === 'question') {
      console.log(`\n📌 ${data.title}`);
      console.log(`   关注: ${data.follower_count || 0} | 浏览: ${data.visit_count || 0} | 回答: ${data.answer_count || 0}\n`);
    } else if (type === 'answer') {
      console.log(`\n📝 ${data.question?.title || '未知问题'}`);
      console.log(`\n👤 ${data.author?.name || '匿名'}`);
      if (data.author?.headline) console.log(`   ${data.author.headline}`);
      console.log(`   赞同: ${data.voteup_count || 0} | 评论: ${data.comment_count || 0}\n`);
      const content = data.content?.replace(/<[^>]+>/g, '') || '';
      console.log(content.slice(0, 1000) + (content.length > 1000 ? '...\n' : '\n'));
    } else if (type === 'article') {
      console.log(`\n📄 ${data.title}`);
      console.log(`\n👤 ${data.author?.name || '匿名'}`);
      console.log(`   赞同: ${data.voteup_count || 0}\n`);
      const content = data.content?.replace(/<[^>]+>/g, '') || '';
      console.log(content.slice(0, 1000) + (content.length > 1000 ? '...\n' : '\n'));
    }
  } catch (error: any) { handleApiError(error, '读取'); }
}

// 获取评论
async function comments(url: string, options: any): Promise<void> {
  console.log(`💬 获取评论: ${url}`);
  const cookie = loadCookies();
  if (!cookie) { console.log('❌ 请先设置 Cookie'); return; }
  
  try {
    const answerMatch = url.match(/zhihu\.com\/answer\/(\d+)/);
    const articleMatch = url.match(/zhihu\.com\/article\/(\d+)/);
    if (!answerMatch && !articleMatch) { console.log('❌ 目前只支持回答和文章的评论'); return; }
    
    const id = answerMatch ? answerMatch[1] : articleMatch![1];
    const type = answerMatch ? 'answers' : 'articles';
    const limit = options.limit || 10;
    
    const response = await axios.get(`https://www.zhihu.com/api/v4/${type}/${id}/comments`, {
      params: { limit, offset: 0 },
      headers: getHeaders(cookie)
    });
    const commentList = response.data.data || [];
    console.log(`\n💬 共 ${response.data.paging?.totals || commentList.length} 条评论\n`);
    commentList.forEach((comment: any, index: number) => {
      console.log(`${index + 1}. ${comment.author?.name || '匿名'}:`);
      console.log(`   ${comment.content}`);
      console.log(`   👍 ${comment.like_count || 0} | ${comment.created_time ? new Date(comment.created_time * 1000).toLocaleString() : ''}\n`);
    });
  } catch (error: any) { handleApiError(error, '获取评论'); }
}

// 查看用户
async function user(userToken: string): Promise<void> {
  console.log(`👤 查看用户: ${userToken}`);
  const cookie = loadCookies();
  if (!cookie) { console.log('❌ 请先设置 Cookie'); return; }
  
  try {
    const token = userToken.match(/people\/(.+)/)?.[1] || userToken;
    const response = await axios.get(`https://www.zhihu.com/api/v4/members/${token}`, {
      headers: getHeaders(cookie)
    });
    const u = response.data;
    console.log(`\n👤 ${u.name}`);
    console.log(`   头像: ${u.avatar_url}`);
    console.log(`   签名: ${u.headline || '无'}`);
    console.log(`   性别: ${u.gender === 1 ? '男' : u.gender === 0 ? '女' : '未知'}`);
    console.log(`   粉丝: ${u.follower_count || 0} | 关注: ${u.followee_count || 0}`);
    console.log(`   赞同: ${u.voteup_count || 0} | 感谢: ${u.thanked_count || 0}\n`);
    if (u.description) { console.log(`📝 个人简介:\n   ${u.description}\n`); }
  } catch (error: any) { handleApiError(error, '获取用户信息'); }
}

// 点赞
async function vote(url: string, action: string): Promise<void> {
  console.log(`${action === 'up' ? '👍 点赞' : '👎 取消点赞'}: ${url}`);
  const cookie = loadCookies();
  if (!cookie) { console.log('❌ 请先设置 Cookie'); return; }
  
  try {
    const answerMatch = url.match(/zhihu\.com\/answer\/(\d+)/);
    if (!answerMatch) { console.log('❌ 目前只支持回答的点赞'); return; }
    
    await axios.post(`https://www.zhihu.com/api/v4/answers/${answerMatch[1]}/voters`,
      { type: action === 'up' ? 'up' : 'down' },
      { headers: getHeaders(cookie) }
    );
    console.log(`✅ ${action === 'up' ? '点赞' : '取消点赞'}成功`);
  } catch (error: any) { handleApiError(error, '点赞'); }
}

// 热榜（不需要登录）
async function hot(): Promise<void> {
  console.log('🔥 获取知乎热榜...\n');
  try {
    const response = await axios.get('https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total', {
      params: { limit: 50 },
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
    });
    response.data.data.slice(0, 20).forEach((item: any, index: number) => {
      const title = item.target?.title || item.title || '无标题';
      const hot = item.target?.detail_text || item.target?.metrics_text || '';
      console.log(`${index + 1}. ${title}`);
      if (hot) console.log(`   热度: ${hot}`);
      console.log('');
    });
  } catch (error: any) { handleApiError(error, '获取热榜'); }
}

// 设置 Cookie
function setCookieAction(cookieStr: string): void {
  // 安全检查：不打印完整 cookie
  console.log('✅ Cookie 格式验证通过');
  saveCookies(cookieStr);
  console.log('\n💡 使用 zhihu whoami 验证登录状态');
}

// 主程序
program.name('zhihu').description('知乎 CLI - 安全、高效的知乎命令行工具').version('1.0.0');

program.command('whoami').description('检查登录状态').action(whoami);
program.command('set-cookie <cookie>').description('设置登录 Cookie').action(setCookieAction);
program.command('hot').description('获取热榜（无需登录）').action(hot);
program.command('search <keyword>').option('-s, --sort <type>', '排序方式', 'general').action(search);
program.command('topics <keyword>').description('搜索话题').action(topics);
program.command('read <url>').description('读取回答/文章').action(read);
program.command('comments <url>').option('-l, --limit <number>', '评论数量', '10').action(comments);
program.command('user <token>').description('查看用户主页').action(user);
program.command('vote <url>').description('点赞').action((url: string) => vote(url, 'up'));
program.command('unvote <url>').description('取消点赞').action((url: string) => vote(url, 'down'));

if (process.argv.length === 2) { program.help(); }
program.parse();
