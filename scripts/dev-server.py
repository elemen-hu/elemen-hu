"""Helyi fejlesztői szerver gyorsítótár nélkül, hogy a CSS/JS módosítások azonnal látszódjanak.

Futtatás a repó gyökeréből: python3 scripts/dev-server.py [port]
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
ThreadingHTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
