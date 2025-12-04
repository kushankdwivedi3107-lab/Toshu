import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { Inspector } from './components/Inspector';
import { Clock } from './components/Clock';
import { StickyNotes } from './components/StickyNotes';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'bw' | 'paper';

export interface CustomTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  backgroundImage?: string;
}

export interface DocumentContent {
  title: string;
  content: string;
}

export interface Stats {
  wordCount: number;
  characterCount: number;
  pageCount: number;
  readingTime: string;
  lastModified?: string;
}

export interface GrammarIssue {
  id: string;
  text: string;
  suggestion: string;
  type: 'spelling' | 'grammar' | 'style';
  severity: 'error' | 'warning' | 'info';
}

const API_BASE = 'http://localhost:5174/api';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [headerOpen, setHeaderOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [customTheme, setCustomTheme] = useState<CustomTheme>({
    primaryColor: '#E53E3E',
    secondaryColor: '#319795',
    backgroundColor: '#F9FAFB',
    textColor: '#1F2937',
  });
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  
  // Document and data state
  const [document, setDocument] = useState<DocumentContent>({
    title: 'Untitled Document',
    content: ''
  });
  const [stats, setStats] = useState<Stats>({
    wordCount: 0,
    characterCount: 0,
    pageCount: 0,
    readingTime: '0 min'
  });
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);

  // Load initial data from backend
  useEffect(() => {
    loadDocument();
    loadTheme();
  }, []);

  // Periodically fetch stats and grammar check
  useEffect(() => {
    if (!document.content) return;
    const timer = setTimeout(() => {
      fetchStats();
      fetchGrammarCheck();
    }, 1000); // Debounce updates
    return () => clearTimeout(timer);
  }, [document.content]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+I / Cmd+I - Toggle Inspector
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setInspectorOpen(!inspectorOpen);
      }
      // Ctrl+Shift+S / Cmd+Shift+S - Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
      // Ctrl+T / Cmd+T - Toggle Theme Customizer
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        setShowThemeCustomizer(!showThemeCustomizer);
      }
      // Ctrl+K / Cmd+K - Toggle Clock
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowClock(!showClock);
      }
      // Ctrl+N / Cmd+N - Toggle Sticky Notes
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowStickyNotes(!showStickyNotes);
      }
      // Ctrl+S / Cmd+S - Save Document (handled by auto-save, but show feedback)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocument(document);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectorOpen, sidebarOpen, showThemeCustomizer, showClock, showStickyNotes, document]);

  // API calls
  const loadDocument = async () => {
    try {
      const response = await fetch(`${API_BASE}/document`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  };

  const saveDocument = async (doc: DocumentContent) => {
    try {
      await fetch(`${API_BASE}/document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchGrammarCheck = async () => {
    try {
      const response = await fetch(`${API_BASE}/grammar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: document.content })
      });
      if (response.ok) {
        const data = await response.json();
        setGrammarIssues(data.issues || []);
      }
    } catch (error) {
      console.error('Failed to fetch grammar check:', error);
    }
  };

  const loadTheme = async () => {
    try {
      const response = await fetch(`${API_BASE}/theme`);
      if (response.ok) {
        const data = await response.json();
        setTheme(data.theme as Theme);
        if (data.custom) {
          setCustomTheme(data.custom);
        }
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const updateTheme = useCallback(async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await fetch(`${API_BASE}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
      });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  const updateCustomTheme = useCallback(async (newCustomTheme: CustomTheme) => {
    setCustomTheme(newCustomTheme);
    try {
      await fetch(`${API_BASE}/custom-theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomTheme)
      });
    } catch (error) {
      console.error('Failed to save custom theme:', error);
    }
  }, []);

  const handleDocumentChange = useCallback((updatedDoc: DocumentContent) => {
    setDocument(updatedDoc);
    saveDocument(updatedDoc);
  }, []);

  const themeClasses = {
    light: '',
    dark: '',
    bw: '',
    paper: ''
  };

  const getBackgroundColor = () => {
    if (customTheme.backgroundImage) return 'transparent';
    if (theme === 'dark') return '#111827';
    if (theme === 'bw') return '#FFFFFF';
    if (theme === 'paper') return '#F5E6D3';
    return '#F9FAFB';
  };

  const backgroundStyle: React.CSSProperties = customTheme.backgroundImage 
    ? { 
        backgroundImage: `url(${customTheme.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }
    : { backgroundColor: getBackgroundColor() };

  return (
    <div className={`flex h-screen relative overflow-hidden`} style={backgroundStyle}>
      {/* Overlay for transparency when wallpaper is set */}
      {customTheme.backgroundImage && (
        <div className="absolute inset-0 bg-black/5 pointer-events-none z-0" />
      )}

      {/* Left Sidebar Trigger Strip */}
      <div 
        onMouseEnter={() => setSidebarOpen(true)}
        className="absolute left-0 top-0 bottom-0 w-2 z-30 hover:bg-red-500/20 transition-colors"
      />
      
      {/* Left Sidebar */}
      <div 
        onMouseLeave={() => setSidebarOpen(false)}
        className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none"
      >
        <div className={sidebarOpen ? 'pointer-events-auto' : ''}>
          <Sidebar 
            isOpen={sidebarOpen} 
            theme={theme} 
            onShowClock={() => setShowClock(true)}
            onShowStickyNotes={() => setShowStickyNotes(true)}
            hasWallpaper={!!customTheme.backgroundImage}
          />
        </div>
      </div>

      {/* Top Header/Toolbar Trigger Strip */}
      <div 
        onMouseEnter={() => setHeaderOpen(true)}
        className="absolute top-0 left-0 right-0 h-2 z-30 hover:bg-red-500/20 transition-colors"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div
          onMouseLeave={() => setHeaderOpen(false)}
          className={`
            transition-transform duration-300 ease-in-out absolute top-0 left-0 right-0 z-20
            ${headerOpen ? 'translate-y-0' : '-translate-y-full'}
          `}
        >
          <Header 
            theme={theme} 
            onThemeChange={updateTheme}
            onShowThemeCustomizer={() => setShowThemeCustomizer(true)}
            hasWallpaper={!!customTheme.backgroundImage}
          />
          <Toolbar 
            theme={theme} 
            hasWallpaper={!!customTheme.backgroundImage}
            onSave={() => saveDocument(document)}
          />
        </div>
        <Editor 
          theme={theme} 
          customTheme={customTheme} 
          hasWallpaper={!!customTheme.backgroundImage}
          document={document}
          onDocumentChange={handleDocumentChange}
        />
      </div>

      {/* Right Inspector Trigger Strip */}
      <div 
        onMouseEnter={() => setInspectorOpen(true)}
        className="absolute right-0 top-0 bottom-0 w-2 z-30 hover:bg-red-500/20 transition-colors"
      />

      {/* Right Inspector Panel */}
      <div 
        className={`
          absolute right-0 top-0 bottom-0 z-20 pointer-events-none
          ${inspectorOpen ? 'pointer-events-auto' : ''}
        `}
      >
        <div className="h-full flex flex-col">
          <Inspector 
            isOpen={inspectorOpen} 
            theme={theme} 
            hasWallpaper={!!customTheme.backgroundImage}
            stats={stats}
            grammarIssues={grammarIssues}
          />
        </div>
      </div>

      {/* Clock Modal */}
      {showClock && (
        <Clock onClose={() => setShowClock(false)} theme={theme} />
      )}

      {/* Sticky Notes Modal */}
      {showStickyNotes && (
        <StickyNotes onClose={() => setShowStickyNotes(false)} theme={theme} />
      )}

      {/* Theme Customizer Modal */}
      {showThemeCustomizer && (
        <ThemeCustomizer 
          onClose={() => setShowThemeCustomizer(false)}
          theme={theme}
          customTheme={customTheme}
          onCustomThemeChange={updateCustomTheme}
        />
      )}
    </div>
  );
}