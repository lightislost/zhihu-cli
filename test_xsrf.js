const axios = require('axios');
const fs = require('fs');

async function test() {
  const cookie = fs.readFileSync('C:/Users/Administrator/.openclaw/.zhihu-cookies', 'utf-8').trim();
  
  const client = axios.create({ 
    headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Cookie': cookie
    }
  });
  
  const resp = await client.get('https://www.zhihu.com/');
  
  const match = resp.data.match(/name="_xsrf" value="([^"]+)"/);
  console.log(match ? match[1] : 'no xsrf');
}

test().catch(e => console.log('err', e.response?.status, e.message));
