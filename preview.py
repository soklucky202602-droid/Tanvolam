#!/usr/bin/env python3
"""Local static preview; contains no game backend or remote API proxy."""
import json
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parent/'site'
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
 def unavailable(self):
  body=json.dumps({'error':'Bản tải chỉ có tệp công khai. Chưa có backend riêng.'},ensure_ascii=False).encode()
  self.send_response(501);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
 def do_GET(self):
  path=urlsplit(self.path).path
  if path.startswith('/api/'): return self.unavailable()
  if path in ('/play01','/play01/'):self.path='/play01.html'
  return super().do_GET()
 def do_POST(self):self.unavailable()
 def do_PUT(self):self.unavailable()
 def do_DELETE(self):self.unavailable()
if __name__=='__main__':
 print('Trang chủ: http://127.0.0.1:8000/\nTrang game: http://127.0.0.1:8000/play01\nCtrl+C để dừng. Game cần backend riêng để đăng nhập.')
 ThreadingHTTPServer(('127.0.0.1',8000),Handler).serve_forever()
