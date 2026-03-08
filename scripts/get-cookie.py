#!/usr/bin/env python3
"""自动从本地 Chrome 浏览器提取知乎 Cookie"""
import browser_cookie3
import json
import sys

def get_zhihu_cookies():
    """从 Chrome 提取知乎 Cookie"""
    try:
        cookies = browser_cookie3.chrome(domain_name='zhihu.com')
        cookie_dict = {c.name: c.value for c in cookies}
        z_c0 = cookie_dict.get('z_c0')
        a1 = cookie_dict.get('a1')
        
        if not z_c0:
            print("ERROR: No z_c0 found, please login to Zhihu in Chrome first")
            return None
        
        # 构建完整 Cookie 字符串
        full_cookie = "; ".join([f"{k}={v}" for k,v in cookie_dict.items()])
        
        return full_cookie
    except Exception as e:
        print(f"ERROR: {e}")
        return None

if __name__ == '__main__':
    result = get_zhihu_cookies()
    if result:
        # 输出 JSON 格式，方便 Node.js 解析
        print(json.dumps({"cookie": result}))
    else:
        sys.exit(1)
