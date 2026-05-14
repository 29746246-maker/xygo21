#!/usr/bin/env python3
"""SPA 静态文件服务器 - 所有路由回退到 index.html"""

import http.server
import os
import sys

PORT = 8000
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')


class SPAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """支持 SPA 路由的 HTTP 请求处理器"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def translate_path(self, path):
        """将请求路径映射到文件系统路径"""
        # 先尝试找实际文件
        fs_path = super().translate_path(path)

        # 如果文件存在且不是目录，直接返回
        if os.path.exists(fs_path) and not os.path.isdir(fs_path):
            return fs_path

        # 否则返回 index.html（SPA 回退）
        index_path = os.path.join(DIST_DIR, 'index.html')
        if os.path.exists(index_path):
            return index_path

        return fs_path

    def log_message(self, format, *args):
        """自定义日志输出"""
        print(f"[{self.log_date_time_string()}] {args[0]} {args[1]} {args[2]}")


if __name__ == '__main__':
    print("=" * 50)
    print("  AI 团队协作应用 - SPA 服务器")
    print("=" * 50)
    print(f"  服务目录: {DIST_DIR}")
    print(f"  启动地址: http://localhost:{PORT}")
    print(f"  所有路由均支持 SPA 导航")
    print("=" * 50)

    server = http.server.HTTPServer(("", PORT), SPAHTTPRequestHandler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
        server.server_close()
