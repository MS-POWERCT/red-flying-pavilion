#!/usr/bin/env python3
"""Local static server: missing URLs serve 404.html with HTTP 404 (URL stays unchanged)."""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
NOT_FOUND = os.path.join(ROOT, "404.html")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_error(self, code, message=None, explain=None):
        if code != 404 or not os.path.isfile(NOT_FOUND):
            super().send_error(code, message, explain)
            return
        try:
            with open(NOT_FOUND, "rb") as f:
                body = f.read()
        except OSError:
            super().send_error(code, message, explain)
            return
        self.send_response(404, message)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    server = ThreadingHTTPServer(("", port), Handler)
    print("Serving %s at http://127.0.0.1:%s/" % (ROOT, port), flush=True)
    print("Missing paths return 404.html with status 404.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
