import http.server
import socketserver
import threading
import webbrowser
import os
import sys
import webview

# Config
PORT = 5174
BUILD_DIR = os.path.join(os.path.dirname(__file__), 'web_ui', 'build')

if not os.path.isdir(BUILD_DIR):
    print('Build directory not found:', BUILD_DIR)
    sys.exit(1)

class SilentHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def start_server():
    os.chdir(BUILD_DIR)
    handler = SilentHTTPRequestHandler
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"Serving {BUILD_DIR} at http://127.0.0.1:{PORT}")
        httpd.serve_forever()

if __name__ == '__main__':
    # Start HTTP server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    url = f'http://127.0.0.1:{PORT}/index.html'

    # Optionally open in default browser as fallback
    try:
        webview.create_window('Toshu — Offline', url, width=1400, height=900)
        webview.start()
    except Exception as e:
        print('pywebview failed to open window, opening browser instead:', e)
        webbrowser.open(url)
