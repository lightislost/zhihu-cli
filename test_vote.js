const axios = require('axios');
const fs = require('fs');

const cookie = fs.readFileSync('C:/Users/Administrator/.openclaw/.zhihu-cookies', 'utf-8').trim();

const headers = { 
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://www.zhihu.com/',
  'Cookie': cookie,
  'Content-Type': 'application/json',
  'x-api-version': '3.0.100',
  'x-requested-with': 'fetch',
  'origin': 'https://www.zhihu.com'
};

const answerId = '1944119751220662293';

// 测试各种可能的API端点
const tests = [
  { name: 'v4 voteup POST empty', method: 'post', url: `https://www.zhihu.com/api/v4/answers/${answerId}/voteup` },
  { name: 'v4 vote POST {type:up}', method: 'post', url: `https://www.zhihu.com/api/v4/answers/${answerId}/vote`, data: { type: 'up' } },
  { name: 'v4 vote PUT', method: 'put', url: `https://www.zhihu.com/api/v4/answers/${answerId}/vote` },
  { name: 'v3 voteup', method: 'post', url: `https://www.zhihu.com/api/v3/answers/${answerId}/voteup` },
  { name: 'v5 voteup', method: 'post', url: `https://www.zhihu.com/api/v5/answers/${answerId}/voteup` },
];

async function runTests() {
  for (const test of tests) {
    try {
      const resp = await axios[test.method](test.url, test.data || {}, { headers });
      console.log(`${test.name}: ${resp.status}`, resp.data);
    } catch (e) {
      console.log(`${test.name}: ${e.response?.status || 'err'} - ${e.response?.data?.error?.message || e.message}`);
    }
  }
}

runTests();
