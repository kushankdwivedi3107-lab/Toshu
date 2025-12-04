import http.server
import socketserver
import threading
import json
import os
import re
import winsound
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Config
PORT = 5174
BUILD_DIR = os.path.join(os.path.dirname(__file__), 'web_ui', 'build')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DOCUMENT_PATH = os.path.join(DATA_DIR, 'document.txt')
REFS_PATH = os.path.join(DATA_DIR, 'references.json')
STICKY_PATH = os.path.join(DATA_DIR, 'sticky_notes.json')

# Ensure data directories exist
os.makedirs(DATA_DIR, exist_ok=True)

# Global state
app_state = {
    'document_content': '',
    'theme': 'light',
    'custom_theme': {
        'primaryColor': '#E53E3E',
        'secondaryColor': '#319795',
        'backgroundColor': '#F9FAFB',
        'textColor': '#1F2937'
    },
    'references': [],
    'sticky_notes': []
}

# Load saved data
def load_data():
    global app_state
    if os.path.exists(DOCUMENT_PATH):
        with open(DOCUMENT_PATH, 'r', encoding='utf-8') as f:
            app_state['document_content'] = f.read()
    if os.path.exists(REFS_PATH):
        with open(REFS_PATH, 'r', encoding='utf-8') as f:
            try:
                app_state['references'] = json.load(f)
            except:
                app_state['references'] = []
    if os.path.exists(STICKY_PATH):
        with open(STICKY_PATH, 'r', encoding='utf-8') as f:
            try:
                app_state['sticky_notes'] = json.load(f)
            except:
                app_state['sticky_notes'] = []

def save_data():
    with open(DOCUMENT_PATH, 'w', encoding='utf-8') as f:
        f.write(app_state['document_content'])
    with open(REFS_PATH, 'w', encoding='utf-8') as f:
        json.dump(app_state['references'], f, ensure_ascii=False, indent=2)
    with open(STICKY_PATH, 'w', encoding='utf-8') as f:
        json.dump(app_state['sticky_notes'], f, ensure_ascii=False, indent=2)

# API handlers
def get_stats():
    raw = app_state['document_content']
    # strip HTML tags if content contains formatted HTML
    content = re.sub(r'<[^>]+>', '', raw)
    words = len(content.split()) if content.strip() else 0
    chars = len(content)
    pages = max(1, round(words / 250, 1)) if words > 0 else 0
    reading_time_mins = max(1, round(words / 200)) if words > 0 else 0
    
    return {
        'wordCount': words,
        'characterCount': chars,
        'pageCount': pages,
        'readingTime': f'{reading_time_mins} min',
        'lastModified': datetime.now().isoformat()
    }

def get_grammar_check():
    raw = app_state['document_content']
    content = re.sub(r'<[^>]+>', '', raw)
    issues = []
    
    # Simple heuristic checks
    if len(content.split()) < 10:
        return issues  # Skip checks for very short text
    
    # Check for long sentences
    sentences = content.split('.')
    for i, sentence in enumerate(sentences):
        words_in_sentence = len(sentence.split())
        if words_in_sentence > 30:
            issues.append({
                'id': str(i),
                'text': sentence.strip()[:50] + '...' if len(sentence) > 50 else sentence.strip(),
                'suggestion': 'Consider breaking this sentence into shorter ones',
                'type': 'style',
                'severity': 'warning'
            })
    
    # Check for multiple spaces
    if re.search(r'  {2,}', content):
        issues.append({
            'id': 'spacing',
            'text': 'Multiple spaces detected',
            'suggestion': 'Remove extra spaces between words',
            'type': 'formatting',
            'severity': 'info'
        })
    
    # Check for passive voice
    passive_matches = re.findall(r'\bwas\s+\w+ed\b', content)
    if len(passive_matches) > 3:
        issues.append({
            'id': 'passive',
            'text': f'Passive voice detected {len(passive_matches)} times',
            'suggestion': 'Consider using active voice for more engaging writing',
            'type': 'style',
            'severity': 'warning'
        })
    
    return issues[:5]  # Return top 5

def api_handler(path, method, body):
    """Handle API requests"""
    
    if path == '/api/document' and method == 'GET':
        return {
            'title': 'Document',
            'content': app_state['document_content']
        }
    
    elif path == '/api/document' and method == 'POST':
        try:
            data = json.loads(body)
            app_state['document_content'] = data.get('content', '')
            save_data()
            return {'status': 'saved'}
        except:
            return {'error': 'Invalid request'}, 400
    
    elif path == '/api/stats' and method == 'GET':
        return get_stats()
    
    elif path == '/api/grammar' and method == 'POST':
        try:
            data = json.loads(body)
            content = data.get('text', '')
            if content:
                app_state['document_content'] = content
            return {'issues': get_grammar_check()}
        except:
            return {'issues': []}
    
    elif path == '/api/references' and method == 'GET':
        return {'references': app_state['references']}
    
    elif path == '/api/references' and method == 'POST':
        try:
            data = json.loads(body)
            text = data.get('text', '')
            if text:
                app_state['references'].append({
                    'id': len(app_state['references']) + 1,
                    'text': text,
                    'added': datetime.now().isoformat()
                })
                save_data()
                return {'status': 'added', 'count': len(app_state['references'])}
            return {'error': 'No text provided'}, 400
        except:
            return {'error': 'Invalid request'}, 400
    
    elif path.startswith('/api/references/') and method == 'DELETE':
        try:
            ref_id = int(path.split('/')[-1])
            app_state['references'] = [r for r in app_state['references'] if r.get('id') != ref_id]
            save_data()
            return {'status': 'deleted'}
        except:
            return {'error': 'Invalid id'}, 400
    
    elif path == '/api/theme' and method == 'GET':
        return {'theme': app_state['theme']}
    
    elif path == '/api/theme' and method == 'POST':
        try:
            data = json.loads(body)
            app_state['theme'] = data.get('theme', 'light')
            return {'status': 'updated', 'theme': app_state['theme']}
        except:
            return {'error': 'Invalid request'}, 400
    
    elif path == '/api/custom-theme' and method == 'GET':
        return app_state['custom_theme']
    
    elif path == '/api/custom-theme' and method == 'POST':
        try:
            data = json.loads(body)
            app_state['custom_theme'].update(data)
            return {'status': 'updated', 'theme': app_state['custom_theme']}
        except:
            return {'error': 'Invalid request'}, 400
    
    elif path == '/api/sticky-notes' and method == 'GET':
        return {'notes': app_state['sticky_notes']}

    elif path == '/api/sticky-notes' and method == 'POST':
        try:
            data = json.loads(body)
            notes = data.get('notes')
            if isinstance(notes, list):
                app_state['sticky_notes'] = notes
                save_data()
                return {'status': 'saved', 'count': len(notes)}
            else:
                return {'error': 'Invalid notes format'}, 400
        except Exception:
            return {'error': 'Invalid request'}, 400

    elif path == '/api/alarm' and method == 'POST':
        try:
            data = json.loads(body)
            duration = data.get('duration', 500)
            frequency = data.get('frequency', 1000)
            # Beep 3 times with short duration
            for _ in range(3):
                winsound.Beep(frequency, duration)
            return {'status': 'alarm_triggered'}
        except Exception as e:
            return {'error': str(e)}, 400
    
    return {'error': 'Not found'}, 404

class ToshuHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            try:
                result = api_handler(self.path, 'GET', '')
                if isinstance(result, tuple) and len(result) == 2:
                    response, status = result
                else:
                    response = result
                    status = 200
            except Exception as e:
                response = {'error': 'Server error', 'detail': str(e)}
                status = 500

            self.send_response(status if isinstance(status, int) else 200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                result = api_handler(self.path, 'POST', body)
                if isinstance(result, tuple) and len(result) == 2:
                    response, status = result
                else:
                    response = result
                    status = 200
            except Exception as e:
                response = {'error': 'Server error', 'detail': str(e)}
                status = 500

            self.send_response(status if isinstance(status, int) else 200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_DELETE(self):
        if self.path.startswith('/api/'):
            try:
                result = api_handler(self.path, 'DELETE', '')
                if isinstance(result, tuple) and len(result) == 2:
                    response, status = result
                else:
                    response = result
                    status = 200
            except Exception as e:
                response = {'error': 'Server error', 'detail': str(e)}
                status = 500

            self.send_response(status if isinstance(status, int) else 200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        pass

def start_server():
    os.chdir(BUILD_DIR)
    handler = ToshuHTTPRequestHandler
    with socketserver.TCPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"Toshu serving at http://127.0.0.1:{PORT}")
        httpd.serve_forever()

if __name__ == '__main__':
    import webview
    
    load_data()
    
    # Start HTTP server
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    url = f'http://127.0.0.1:{PORT}/index.html'

    # Open in native window
    try:
        webview.create_window('Toshu — Advanced Writing Environment', url, width=1400, height=900)
        webview.start()
    except Exception as e:
        print('Error:', e)
