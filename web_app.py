#!/usr/bin/env python3
"""
Toshu - Web-based UI using pywebview
Provides a modern, sliding interface matching the Figma design
"""

import webview
import os
import json
from pathlib import Path

class ToshuAPI:
    """Backend API for Toshu web app"""
    
    def __init__(self):
        self.theme = "light"
        self.document_content = ""
        self.references = []
        self.custom_theme = {
            "primaryColor": "#E53E3E",
            "secondaryColor": "#319795",
            "backgroundColor": "#F9FAFB",
            "textColor": "#1F2937"
        }
    
    def set_theme(self, theme):
        """Set the current theme"""
        self.theme = theme
        return {"status": "ok", "theme": theme}
    
    def get_theme(self):
        """Get current theme"""
        return {"theme": self.theme}
    
    def save_document(self, content):
        """Save document content"""
        self.document_content = content
        return {"status": "saved"}
    
    def add_reference(self, ref_text):
        """Add a reference"""
        self.references.append({"text": ref_text})
        return {"status": "ok", "count": len(self.references)}
    
    def update_custom_theme(self, colors):
        """Update custom theme colors"""
        self.custom_theme.update(colors)
        return {"status": "ok", "theme": self.custom_theme}
    
    def get_stats(self):
        """Get document statistics"""
        words = len(self.document_content.split())
        chars = len(self.document_content)
        return {
            "words": words,
            "characters": chars,
            "characters_no_spaces": len(self.document_content.replace(" ", "")),
            "sentences": self.document_content.count("."),
            "paragraphs": self.document_content.count("\n\n"),
            "pages": round(words / 250, 1)
        }

def create_html():
    """Generate HTML for the web UI"""
    return '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toshu - Advanced Writing Environment</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            background: #f9fafb;
            color: #111827;
        }

        body.dark {
            background: #0d0d0d;
            color: #f9fafb;
        }

        body.bw {
            background: #ffffff;
            color: #000000;
        }

        body.paper {
            background: #F5E6D3;
            color: #6B4423;
        }

        .container {
            display: flex;
            height: 100vh;
            overflow: hidden;
        }

        /* Sidebar */
        .sidebar-trigger {
            position: absolute;
            left: 0;
            top: 0;
            width: 8px;
            height: 100%;
            z-index: 30;
            cursor: pointer;
        }

        .sidebar {
            position: absolute;
            left: 0;
            top: 0;
            width: 280px;
            height: 100%;
            background: #ffffff;
            border-right: 1px solid #e5e7eb;
            z-index: 20;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
            overflow-y: auto;
            padding: 20px;
            box-shadow: 2px 0 8px rgba(0,0,0,0.1);
        }

        body.dark .sidebar {
            background: #1a1a1a;
            border-color: #404040;
        }

        .sidebar.open {
            transform: translateX(0);
        }

        .sidebar h3 {
            font-size: 16px;
            margin-bottom: 16px;
            font-weight: 600;
        }

        .sidebar-item {
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            background: #f3f4f6;
        }

        body.dark .sidebar-item {
            background: #2a2a2a;
        }

        .sidebar-item:hover {
            background: #e5e7eb;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* Header */
        .header {
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        body.dark .header {
            background: #1a1a1a;
            border-color: #404040;
        }

        .header-title {
            font-size: 18px;
            font-weight: 600;
        }

        .header-controls {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .btn {
            padding: 8px 16px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: #ffffff;
            color: #1f2937;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            font-weight: 500;
        }

        body.dark .btn {
            background: #2a2a2a;
            border-color: #404040;
            color: #f9fafb;
        }

        .btn:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
        }

        body.dark .btn:hover {
            background: #3a3a3a;
        }

        .btn-primary {
            background: #E53E3E;
            color: white;
            border-color: #E53E3E;
        }

        .btn-primary:hover {
            background: #d32f2f;
        }

        /* Toolbar */
        .toolbar {
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
            padding: 12px 24px;
            display: flex;
            gap: 12px;
            align-items: center;
            flex-wrap: wrap;
            min-height: 60px;
        }

        body.dark .toolbar {
            background: #1a1a1a;
            border-color: #404040;
        }

        select, input[type="number"] {
            padding: 6px 12px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 13px;
            background: #ffffff;
            color: #1f2937;
        }

        body.dark select,
        body.dark input[type="number"] {
            background: #2a2a2a;
            border-color: #404040;
            color: #f9fafb;
        }

        .toolbar-separator {
            width: 1px;
            height: 24px;
            background: #d1d5db;
            margin: 0 4px;
        }

        /* Editor */
        .editor-container {
            flex: 1;
            display: flex;
            overflow: hidden;
        }

        .editor {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            font-size: 16px;
            line-height: 1.6;
        }

        .editor textarea {
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            resize: none;
            font-family: "Times New Roman", serif;
            font-size: 16px;
            line-height: 1.8;
            color: #1f2937;
            background: transparent;
        }

        body.dark .editor textarea {
            color: #f9fafb;
        }

        /* Inspector Panel */
        .inspector-trigger {
            position: absolute;
            right: 0;
            top: 0;
            width: 8px;
            height: 100%;
            z-index: 30;
            cursor: pointer;
        }

        .inspector {
            position: absolute;
            right: 0;
            top: 0;
            width: 320px;
            height: 100%;
            background: #ffffff;
            border-left: 1px solid #e5e7eb;
            z-index: 20;
            transform: translateX(100%);
            transition: transform 0.3s ease-in-out;
            display: flex;
            flex-direction: column;
            box-shadow: -2px 0 8px rgba(0,0,0,0.1);
        }

        body.dark .inspector {
            background: #1a1a1a;
            border-color: #404040;
        }

        .inspector.open {
            transform: translateX(0);
        }

        .inspector-tabs {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
        }

        body.dark .inspector-tabs {
            border-color: #404040;
        }

        .inspector-tab {
            flex: 1;
            padding: 12px;
            text-align: center;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
            background: #f9fafb;
            font-size: 13px;
            font-weight: 500;
        }

        body.dark .inspector-tab {
            background: #0d0d0d;
        }

        .inspector-tab.active {
            border-bottom-color: #E53E3E;
            color: #E53E3E;
        }

        .inspector-content {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }

        .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            margin-bottom: 8px;
            background: #f3f4f6;
            border-radius: 6px;
            font-size: 13px;
        }

        body.dark .stat-item {
            background: #2a2a2a;
        }

        /* Modals */
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .modal.show {
            opacity: 1;
            pointer-events: auto;
        }

        .modal-content {
            background: #ffffff;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px rgba(0,0,0,0.15);
        }

        body.dark .modal-content {
            background: #1a1a1a;
        }

        .modal-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .modal-buttons {
            display: flex;
            gap: 12px;
            margin-top: 20px;
            justify-content: flex-end;
        }

        /* Color Picker */
        .color-group {
            margin-bottom: 16px;
        }

        .color-group label {
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
        }

        .color-group input[type="color"] {
            width: 100%;
            height: 40px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }

        /* Utility Classes */
        .hidden {
            display: none !important;
        }

        .flex-center {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (max-width: 768px) {
            .sidebar, .inspector {
                width: 100%;
            }
        }
    </style>
</head>
<body class="light">
    <div class="container">
        <!-- Sidebar Trigger -->
        <div class="sidebar-trigger" id="sidebarTrigger"></div>

        <!-- Sidebar -->
        <div class="sidebar" id="sidebar">
            <h3>Navigation</h3>
            <div class="sidebar-item" onclick="showModal('sticky')">📝 Sticky Notes</div>
            <div class="sidebar-item" onclick="showModal('clock')">🕐 Clock</div>
            <div class="sidebar-item" onclick="showModal('references')">📚 References</div>
            <div class="sidebar-item" onclick="showModal('customizer')">🎨 Customize Theme</div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Header -->
            <div class="header">
                <div class="header-title">Manuscript: Cognitive Load in Digital Learning</div>
                <div class="header-controls">
                    <select id="themeSelect" onchange="changeTheme(this.value)">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="bw">B&W</option>
                        <option value="paper">Paper</option>
                    </select>
                    <button class="btn" onclick="showModal('customizer')">Customize</button>
                    <button class="btn" id="inspectorBtn" onclick="toggleInspector()">Inspector</button>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
                <select onchange="changeFontFamily(this.value)">
                    <option>Times New Roman</option>
                    <option>Arial</option>
                    <option>Georgia</option>
                    <option>Calibri</option>
                </select>

                <input type="number" min="8" max="72" value="14" onchange="changeFontSize(this.value)">

                <button class="btn" onclick="toggleBold()">B</button>
                <button class="btn" onclick="toggleItalic()">I</button>
                <button class="btn" onclick="toggleUnderline()">U</button>

                <div class="toolbar-separator"></div>

                <button class="btn" onclick="toggleColor()">Color</button>
                <button class="btn" onclick="toggleHighlight()">Highlight</button>

                <div class="toolbar-separator"></div>

                <button class="btn" onclick="alignLeft()">◀</button>
                <button class="btn" onclick="alignCenter()">⬇</button>
                <button class="btn" onclick="alignRight()">▶</button>
                <button class="btn" onclick="alignJustify()">█</button>
            </div>

            <!-- Editor -->
            <div class="editor-container">
                <div class="editor">
                    <textarea id="editor" placeholder="Start typing your manuscript here..."></textarea>
                </div>
            </div>
        </div>

        <!-- Inspector Trigger -->
        <div class="inspector-trigger" id="inspectorTrigger"></div>

        <!-- Inspector Panel -->
        <div class="inspector" id="inspector">
            <div class="inspector-tabs">
                <div class="inspector-tab active" onclick="switchTab('stats', this)">📊 Stats</div>
                <div class="inspector-tab" onclick="switchTab('grammar', this)">✓ Grammar</div>
                <div class="inspector-tab" onclick="switchTab('comments', this)">💬 Comments</div>
            </div>
            <div class="inspector-content" id="inspectorContent">
                <!-- Stats will be populated here -->
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div class="modal" id="clockModal">
        <div class="modal-content flex-center">
            <div id="clock" style="font-size: 48px; font-weight: bold;">00:00:00</div>
        </div>
    </div>

    <div class="modal" id="stickyModal">
        <div class="modal-content">
            <div class="modal-title">Sticky Notes</div>
            <textarea style="width: 100%; height: 300px; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px;" id="stickyNotes" placeholder="Add your notes here..."></textarea>
            <div class="modal-buttons">
                <button class="btn" onclick="closeModal('sticky')">Close</button>
            </div>
        </div>
    </div>

    <div class="modal" id="referencesModal">
        <div class="modal-content">
            <div class="modal-title">References</div>
            <div id="referencesList" style="max-height: 400px; overflow-y: auto;"></div>
            <div class="modal-buttons">
                <button class="btn" onclick="closeModal('references')">Close</button>
            </div>
        </div>
    </div>

    <div class="modal" id="customizerModal">
        <div class="modal-content">
            <div class="modal-title">Customize Theme</div>
            <div class="color-group">
                <label>Primary Color</label>
                <input type="color" id="colorPrimary" value="#E53E3E" onchange="updateThemeColor('primary')">
            </div>
            <div class="color-group">
                <label>Secondary Color</label>
                <input type="color" id="colorSecondary" value="#319795" onchange="updateThemeColor('secondary')">
            </div>
            <div class="color-group">
                <label>Background Color</label>
                <input type="color" id="colorBg" value="#F9FAFB" onchange="updateThemeColor('bg')">
            </div>
            <div class="color-group">
                <label>Text Color</label>
                <input type="color" id="colorText" value="#1F2937" onchange="updateThemeColor('text')">
            </div>
            <div class="modal-buttons">
                <button class="btn" onclick="closeModal('customizer')">Close</button>
                <button class="btn btn-primary" onclick="saveTheme()">Save</button>
            </div>
        </div>
    </div>

    <script>
        const api = window.pywebview.api;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            setupEventListeners();
            updateStats();
            startClock();
        });

        function setupEventListeners() {
            const editor = document.getElementById('editor');
            editor.addEventListener('input', () => {
                updateStats();
            });

            document.getElementById('sidebarTrigger').addEventListener('mouseenter', () => {
                document.getElementById('sidebar').classList.add('open');
            });

            document.getElementById('sidebar').addEventListener('mouseleave', () => {
                document.getElementById('sidebar').classList.remove('open');
            });

            document.getElementById('inspectorTrigger').addEventListener('mouseenter', () => {
                if (document.getElementById('inspector').classList.contains('open')) {
                    // Already open
                }
            });
        }

        function showModal(type) {
            const modals = {
                'clock': 'clockModal',
                'sticky': 'stickyModal',
                'references': 'referencesModal',
                'customizer': 'customizerModal'
            };
            document.getElementById(modals[type]).classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeModal(type) {
            const modals = {
                'clock': 'clockModal',
                'sticky': 'stickyModal',
                'references': 'referencesModal',
                'customizer': 'customizerModal'
            };
            document.getElementById(modals[type]).classList.remove('show');
            document.body.style.overflow = '';
        }

        function changeTheme(theme) {
            document.body.className = theme;
            api.set_theme(theme);
        }

        function toggleInspector() {
            document.getElementById('inspector').classList.toggle('open');
        }

        function switchTab(tab, element) {
            document.querySelectorAll('.inspector-tab').forEach(t => t.classList.remove('active'));
            element.classList.add('active');
            
            if (tab === 'stats') {
                updateStats();
            }
        }

        function updateStats() {
            api.get_stats().then(stats => {
                const content = `
                    <div class="stat-item"><span>Words</span><strong>${stats.words}</strong></div>
                    <div class="stat-item"><span>Characters</span><strong>${stats.characters}</strong></div>
                    <div class="stat-item"><span>Characters (no spaces)</span><strong>${stats.characters_no_spaces}</strong></div>
                    <div class="stat-item"><span>Sentences</span><strong>${stats.sentences}</strong></div>
                    <div class="stat-item"><span>Paragraphs</span><strong>${stats.paragraphs}</strong></div>
                    <div class="stat-item"><span>Estimated Pages</span><strong>${stats.pages}</strong></div>
                `;
                document.getElementById('inspectorContent').innerHTML = content;
            });
        }

        function startClock() {
            function updateClock() {
                const now = new Date();
                const time = now.toLocaleTimeString();
                document.getElementById('clock').textContent = time;
            }
            updateClock();
            setInterval(updateClock, 1000);
        }

        function changeFontFamily(family) {
            document.getElementById('editor').style.fontFamily = family;
        }

        function changeFontSize(size) {
            document.getElementById('editor').style.fontSize = size + 'px';
        }

        function toggleBold() {
            document.execCommand('bold', false, null);
        }

        function toggleItalic() {
            document.execCommand('italic', false, null);
        }

        function toggleUnderline() {
            document.execCommand('underline', false, null);
        }

        function toggleColor() {
            const color = prompt('Enter color (e.g., #FF0000):');
            if (color) document.execCommand('foreColor', false, color);
        }

        function toggleHighlight() {
            const color = prompt('Enter highlight color:');
            if (color) document.execCommand('backColor', false, color);
        }

        function alignLeft() {
            document.execCommand('justifyLeft', false, null);
        }

        function alignCenter() {
            document.execCommand('justifyCenter', false, null);
        }

        function alignRight() {
            document.execCommand('justifyRight', false, null);
        }

        function alignJustify() {
            document.execCommand('justifyFull', false, null);
        }

        function updateThemeColor(type) {
            const colors = {
                primary: document.getElementById('colorPrimary').value,
                secondary: document.getElementById('colorSecondary').value,
                bg: document.getElementById('colorBg').value,
                text: document.getElementById('colorText').value
            };
            api.update_custom_theme(colors);
        }

        function saveTheme() {
            api.update_custom_theme({
                primaryColor: document.getElementById('colorPrimary').value,
                secondaryColor: document.getElementById('colorSecondary').value,
                backgroundColor: document.getElementById('colorBg').value,
                textColor: document.getElementById('colorText').value
            }).then(() => {
                alert('Theme saved!');
                closeModal('customizer');
            });
        }

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                    document.body.style.overflow = '';
                }
            });
        });
    </script>
</body>
</html>
'''

if __name__ == "__main__":
    api = ToshuAPI()
    html = create_html()
    
    webview.create_window(
        "Toshu — Advanced Writing Environment",
        html=html,
        js_api=api,
        width=1400,
        height=900,
        resizable=True,
        fullscreen=False
    )
    webview.start(debug=False)
