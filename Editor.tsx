import { Theme, CustomTheme, DocumentContent } from '../App';
import { useRef, useEffect } from 'react';

interface EditorProps {
  theme: Theme;
  customTheme: CustomTheme;
  hasWallpaper?: boolean;
  document: DocumentContent;
  onDocumentChange: (doc: DocumentContent) => void;
}

export function Editor({ theme, customTheme, hasWallpaper, document, onDocumentChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      // initialize editor content (HTML)
      editorRef.current.innerHTML = document.content || '';
    }
  }, [document.content]);
  const bgClass = hasWallpaper 
    ? 'bg-transparent' 
    : theme === 'dark' 
    ? 'bg-gray-900' 
    : theme === 'bw' 
    ? 'bg-white' 
    : theme === 'paper'
    ? 'bg-[#F5E6D3]'
    : 'bg-gray-50';
  const cardBg = hasWallpaper
    ? 'bg-white/98 backdrop-blur-sm'
    : theme === 'dark' 
    ? 'bg-gray-800' 
    : theme === 'paper'
    ? 'bg-[#FFFEF9]'
    : 'bg-white';
  const borderClass = theme === 'dark' ? 'border-gray-700' : theme === 'bw' ? 'border-4 border-black' : theme === 'paper' ? 'border-2 border-amber-900/20' : 'border-2 border-gray-200';
  const textClass = theme === 'dark' ? 'text-gray-100' : theme === 'paper' ? 'text-amber-950' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-300' : theme === 'paper' ? 'text-amber-900' : 'text-gray-700';
  
  // Paper theme specific styling
  const paperTexture = theme === 'paper' ? `
    background-image: 
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 31px,
        rgba(139, 92, 46, 0.08) 31px,
        rgba(139, 92, 46, 0.08) 32px
      );
  ` : '';

  return (
    <div className={`flex-1 overflow-y-auto ${bgClass} p-8`}>
      {/* Page Card */}
      <div 
        className={`max-w-4xl mx-auto ${cardBg} rounded-xl shadow-md border ${borderClass} p-16 min-h-full`}
        style={{ 
          borderColor: theme === 'paper' ? 'rgba(139, 92, 46, 0.2)' : customTheme.primaryColor,
          ...(theme === 'paper' ? { 
            boxShadow: '0 4px 6px -1px rgba(139, 92, 46, 0.1), 0 2px 4px -1px rgba(139, 92, 46, 0.06)',
            fontFamily: 'Georgia, Cambria, "Times New Roman", serif'
          } : {})
        }}
      >
        {theme === 'paper' && (
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(139, 92, 46, 0.08) 31px, rgba(139, 92, 46, 0.08) 32px)' }} />
        )}
        {/* Document Content - Editable */}
        <div className="space-y-6 relative">
          {/* Title - Editable */}
          <h1 
            className={`text-center mb-8 ${textClass} cursor-text outline-none focus:ring-2 focus:ring-opacity-50 px-2 py-1 rounded`}
            style={{ outline: 'none' }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const newTitle = e.currentTarget.textContent || 'Untitled Document';
              onDocumentChange({ ...document, title: newTitle });
            }}
          >
            {document.title || 'Untitled Document'}
          </h1>

          {/* Main Content - Editable ContentEditable div (supports formatting) */}
          <div
            id="toshu-editor"
            ref={editorRef}
            className={`w-full min-h-96 p-4 ${textClass} ${cardBg} border-none outline-none resize-none prose max-w-none`}
            style={{
              fontFamily: theme === 'paper' ? 'Georgia, Cambria, "Times New Roman", serif' : 'inherit',
              background: 'transparent',
              color: 'inherit',
              whiteSpace: 'pre-wrap'
            }}
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
              const html = editorRef.current?.innerHTML || '';
              onDocumentChange({ ...document, content: html });
            }}
            placeholder="Start typing your document here..."
          />
        </div>
      </div>
    </div>
  );
}