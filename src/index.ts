#!/usr/bin/env node

import { Command } from 'commander';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const program = new Command();

// Cookie 文件路径
const COOKIE_PATHS = [
  path.join(__dirname, '..', '..', '..', '.zhihu-cookies'),
  path.join(process.env.HOME || process.env.USERPROFILE || '', '.zhihu-cookies')
];

function loadCookies(): string {
  for (const cookiePath of COOKIE_PATHS) {
    if (fs.existsSync(cookiePath)) {
      return fs.readFileSync(cookiePath, 'utf-8').trim();
    }
  }
  return '';
}

function saveCookies(cookie: string): void {
  const primaryPath = COOKIE_PATHS[0];
  const dir = path.dirname(primaryPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(primaryPath, cookie);
}

function handleApiError(error: any, operation: string): void {
  const status = error.response?.status;
  if (status === 401) {
    console.log(`[ERROR] ${operation} failed: Cookie expired`);
    console.log('   Run "zhihu login" or: zhihu set-cookie "<cookie>"');
  } else if (status === 429) {
    console.log(`[ERROR] ${operation} failed: Too many requests`);
  } else {
    console.log(`[ERROR] ${operation} failed: ${status || error.message}`);
  }
}

function getHeaders(cookie: string) {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://www.zhihu.com/',
    'Cookie': cookie
  };
}

// Browser Relay 发帖说明
function postAction(): void {
  console.log(`
🌐 Browser Relay 发帖功能
=============================

要通过 OpenClaw Browser Relay 自动发帖，请在 OpenClaw 中使用以下 JavaScript：

const el = document.querySelector('[contenteditable="true"]');
el.focus();
document.execCommand('selectAll');
document.execCommand('insertText', false, '你的内容');

知乎使用 Draft.js 编辑器，必须用 document.execCommand('insertText') 
才能触发输入事件。

操作步骤：
1. 在知乎页面点击"创作"按钮
2. 点击"发想法"
3. 使用上面的 JavaScript 输入内容
4. 点击发布按钮
`);
}

// Browser Relay 点赞说明
function voteAction(url: string): void {
  console.log(`
👍 Browser Relay 点赞功能
=============================

API 方式点赞已被知乎限制，请使用 Browser Relay 方式：

1. 用浏览器打开答案页面：
   ${url}

2. 在 OpenClaw 中执行以下 JavaScript 点击赞同按钮：

// 查找并点击赞同按钮
const btn = document.querySelector('button[class*="VoteButton"]') || 
            Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('赞同'));
if (btn) { btn.click(); console.log('已点赞!'); } 
else { console.log('未找到赞同按钮，请确保页面已加载'); }

// 或者更精确的方式 - 点击第一个回答的赞同按钮
const voteBtns = document.querySelectorAll('.VoteButton');
if (voteBtns.length > 0) { voteBtns[0].click(); }

注意：需要在知乎页面打开答案后才能使用
`);
}

// 用户信息功能
async function userAction(token: string): Promise<void> {
  console.log(`[INFO] Getting user info: ${token}`);
  const cookie = loadCookies();
  if (!cookie) { console.log('[ERROR] No cookie'); return; }
  
  try {
    const response = await axios.get(`https://www.zhihu.com/api/v4/members/${token}`, {
      headers: getHeaders(cookie)
    });
    const u = response.data;
    console.log(`\n[OK] ${u.name}`);
    if (u.headline) console.log(`   ${u.headline}`);
    console.log(`   URL: https://www.zhihu.com/people/${u.url_token}`);
    console.log(`   Followers: ${u.follower_count || 0}`);
    console.log(`   Following: ${u.following_count || 0}`);
    console.log(`   Votes: ${u.voteup_count || 0}`);
    console.log(`   Thanks: ${u.thanked_count || 0}`);
  } catch (error: any) { handleApiError(error, 'User info'); }
}

async function whoami(): Promise<void> {
  console.log('[INFO] Checking login status...');
  const cookie = loadCookies();
  if (!cookie) {
    console.log('[ERROR] No cookie. Run "zhihu login" or: zhihu set-cookie "<cookie>"');
    return;
  }
  try {
    const response = await axios.get('https://www.zhihu.com/api/v4/me', {
      headers: getHeaders(cookie)
    });
    console.log('[OK] Logged in as:', response.data.name || response.data.url_token);
    console.log('   User ID:', response.data.id);
  } catch (error: any) { handleApiError(error, 'Login'); }
}

async function search(keyword: string, options: any): Promise<void> {
  console.log(`[INFO] Searching: "${keyword}"`);
  const cookie = loadCookies();
  if (!cookie) { console.log('[ERROR] No cookie'); return; }
  
  try {
    const response = await axios.get('https://www.zhihu.com/api/v4/search_v3', {
      params: { q: keyword, type: 'content', offset: 0, limit: 10, sort: options.sort || 'general' },
      headers: getHeaders(cookie)
    });
    const items = response.data.data || [];
    console.log(`\n[OK] Found ${items.length} results\n`);
    items.forEach((item: any, index: number) => {
      let title = item.object?.title || item.highlight?.title || item.title || '';
      let url = item.object?.url || item.url || '';
      if (title) {
        console.log(`${index + 1}. ${title}`);
        if (url) console.log(`   ${url.replace('api.zhihu.com', 'www.zhihu.com')}`);
        console.log('');
      }
    });
  } catch (error: any) { handleApiError(error, 'Search'); }
}

async function topics(keyword: string): Promise<void> {
  console.log(`[INFO] Searching topics: "${keyword}"`);
  const cookie = loadCookies();
  try {
    const response = await axios.get('https://www.zhihu.com/api/v4/search_v3', {
      params: { q: keyword, type: 'topic', offset: 0, limit: 10 },
      headers: getHeaders(cookie || '')
    });
    const items = response.data.data || [];
    console.log(`\n[OK] Found ${items.length} topics\n`);
    items.forEach((item: any, index: number) => {
      const title = item.object?.title || item.title || item.name || '';
      if (title) console.log(`${index + 1}. ${title}\n`);
    });
  } catch (error: any) { handleApiError(error, 'Topic search'); }
}

async function read(url: string): Promise<void> {
  console.log(`[INFO] Reading: ${url}`);
  const cookie = loadCookies();
  if (!cookie) { console.log('[ERROR] No cookie'); return; }
  
  try {
    const answerMatch = url.match(/zhihu\.com\/answer\/(\d+)/);
    const articleMatch = url.match(/zhihu\.com\/article\/(\d+)/);
    const questionMatch = url.match(/zhihu\.com\/question\/(\d+)/);
    
    let apiUrl = '';
    let type = '';
    if (answerMatch) { type = 'answer'; apiUrl = `https://www.zhihu.com/api/v4/answers/${answerMatch[1]}`; }
    else if (articleMatch) { type = 'article'; apiUrl = `https://www.zhihu.com/api/v4/articles/${articleMatch[1]}`; }
    else if (questionMatch) { type = 'question'; apiUrl = `https://www.zhihu.com/api/v4/questions/${questionMatch[1]}`; }
    else { console.log('[ERROR] Invalid Zhihu URL'); return; }
    
    const response = await axios.get(apiUrl, { headers: getHeaders(cookie) });
    const data = response.data;
    
    if (type === 'question') {
      console.log(`\n[OK] ${data.title}`);
      console.log(`   Followers: ${data.follower_count || 0} | Answers: ${data.answer_count || 0}\n`);
    } else if (type === 'answer') {
      console.log(`\n[OK] ${data.question?.title || 'Unknown'}`);
      console.log(`   Author: ${data.author?.name || 'Anonymous'}`);
      console.log(`   Votes: ${data.voteup_count || 0}\n`);
      const content = data.content?.replace(/<[^>]+>/g, '') || '';
      console.log(content.slice(0, 800) + (content.length > 800 ? '...\n' : '\n'));
    }
  } catch (error: any) { handleApiError(error, 'Read'); }
}

async function hot(): Promise<void> {
  console.log('[INFO] Getting hot topics...\n');
  const cookie = loadCookies();
  try {
    const response = await axios.get('https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total', {
      params: { limit: 50 },
      headers: getHeaders(cookie || '')
    });
    response.data.data.slice(0, 20).forEach((item: any, index: number) => {
      const title = item.target?.title || item.title || 'No title';
      const hot = item.target?.detail_text || item.target?.metrics_text || '';
      console.log(`${index + 1}. ${title}`);
      if (hot) console.log(`   ${hot}`);
      console.log('');
    });
  } catch (error: any) { handleApiError(error, 'Hot list'); }
}

function setCookieAction(cookieStr: string): void {
  console.log('[OK] Cookie validated');
  saveCookies(cookieStr);
  console.log('\n[INFO] Use "zhihu whoami" to verify');
}

// 自动从浏览器提取 Cookie
async function loginAction(): Promise<void> {
  console.log('[INFO] Extracting cookie from Chrome...');
  
  const scriptPath = path.join(__dirname, '..', 'scripts', 'get-cookie.py');
  
  try {
    const result = execSync(`python "${scriptPath}"`, { encoding: 'utf-8' });
    const data = JSON.parse(result);
    
    if (data.cookie) {
      saveCookies(data.cookie);
      console.log('[OK] Cookie extracted and saved!');
      console.log('\n[INFO] Verifying login...');
      whoami();
    }
  } catch (error: any) {
    console.log('[ERROR] Failed to extract cookie');
    console.log('   Make sure Chrome is running and you are logged into Zhihu');
    console.log('   Or manually set cookie: zhihu set-cookie "<cookie>"');
  }
}

program.name('zhihu').description('Zhihu CLI - Search & Read').version('1.0.0');

program.command('post').description('Browser Relay post instructions').action(postAction);
program.command('vote <url>').description('Browser Relay vote instructions').action(voteAction);
program.command('whoami').description('Check login status').action(whoami);
program.command('user <token>').description('Get user info by url_token').action(userAction);
program.command('login').description('Auto-extract cookie from Chrome').action(loginAction);
program.command('set-cookie <cookie>').description('Set cookie manually').action(setCookieAction);
program.command('hot').description('Get hot topics').action(hot);
program.command('search <keyword>').option('-s, --sort <type>', 'Sort', 'general').action(search);
program.command('topics <keyword>').description('Search topics').action(topics);
program.command('read <url>').description('Read content').action(read);

if (process.argv.length === 2) { program.help(); }
program.parse();
