import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Theme } from '../App';

interface Note {
  id: number;
  content: string;
  color: string;
}

const noteColors = [
  { name: 'Yellow', value: '#FEF08A', dark: '#FDE047' },
  { name: 'Pink', value: '#FBCFE8', dark: '#F9A8D4' },
  { name: 'Blue', value: '#BFDBFE', dark: '#93C5FD' },
  { name: 'Green', value: '#BBF7D0', dark: '#86EFAC' },
  { name: 'Purple', value: '#DDD6FE', dark: '#C4B5FD' },
  { name: 'Orange', value: '#FED7AA', dark: '#FDBA74' },
];

interface StickyNotesProps {
  onClose: () => void;
  theme: Theme;
}

export function StickyNotes({ onClose, theme }: StickyNotesProps) {
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, content: 'Remember to cite Johnson et al. (2020) in methodology section', color: noteColors[0].value },
    { id: 2, content: 'Review statistical analysis before final submission', color: noteColors[2].value },
  ]);
  const [nextId, setNextId] = useState(3);
  const [draggedNote, setDraggedNote] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const [notePositions, setNotePositions] = useState<{ [id: number]: { x: number; y: number } }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const bgClass = theme === 'dark' ? 'bg-gray-800' : theme === 'bw' ? 'bg-white border-4 border-black' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const buttonClass = theme === 'dark' 
    ? 'bg-gray-700 text-white hover:bg-gray-600' 
    : theme === 'bw'
    ? 'bg-white border-2 border-black hover:bg-black hover:text-white'
    : 'bg-gray-100 hover:bg-gray-200';

  const addNote = () => {
    setNotes([...notes, {
      id: nextId,
      content: '',
      color: noteColors[Math.floor(Math.random() * noteColors.length)].value
    }]);
    setNextId(nextId + 1);
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const updateNote = (id: number, content: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, content } : note));
  };

  const updateNoteColor = (id: number, color: string) => {
    setNotes(notes.map(note => note.id === id ? { ...note, color } : note));
  };
  const handleMouseDown = (id: number, e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDraggedNote({
        id,
        offsetX: e.clientX - rect.left - (notePositions[id]?.x || 0),
        offsetY: e.clientY - rect.top - (notePositions[id]?.y || 0),
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNote || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setNotePositions(prev => ({
      ...prev,
      [draggedNote.id]: {
        x: Math.max(0, Math.min(e.clientX - rect.left - draggedNote.offsetX, rect.width - 300)),
        y: Math.max(0, Math.min(e.clientY - rect.top - draggedNote.offsetY, rect.height - 200)),
      }
    }));
  };

  const handleMouseUp = () => {
    setDraggedNote(null);
    // Persist positions when dragging stops
    saveNotes();
  };

  // Load sticky notes from backend on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const res = await fetch('/api/sticky-notes');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.notes)) {
            setNotes(data.notes.map((n: any) => ({ id: n.id, content: n.content, color: n.color || noteColors[0].value })));
            const maxId = data.notes.reduce((m: number, n: any) => Math.max(m, n.id || 0), 0);
            setNextId(maxId + 1);
            const positions: any = {};
            data.notes.forEach((n: any) => { if (n.x !== undefined && n.y !== undefined) positions[n.id] = { x: n.x, y: n.y }; });
            setNotePositions(positions);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    loadNotes();
  }, []);

  // Save notes to backend
  const saveNotes = async () => {
    try {
      const payload = notes.map(n => ({ id: n.id, content: n.content, color: n.color, x: notePositions[n.id]?.x, y: notePositions[n.id]?.y }));
      await fetch('/api/sticky-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: payload })
      });
    } catch (e) {
      // ignore
    }
  };

  // Auto-save when notes or positions change (debounced)
  useEffect(() => {
    const t = setTimeout(() => saveNotes(), 800);
    return () => clearTimeout(t);
  }, [notes, notePositions]);
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        className="fixed inset-0 z-50"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg ${buttonClass} transition-colors z-10`}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-3xl ${textClass}`}>Sticky Notes</h2>
          <button
            onClick={addNote}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme === 'bw' ? 'bg-black text-white hover:bg-gray-800' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors`}
          >
            <Plus size={20} />
            Add Note
          </button>
        </div>

        {/* Floating Notes */}
        <div className="relative w-full h-full">
          {notes.map(note => (
            <div
              key={note.id}
              className="absolute rounded-lg shadow-lg p-4 w-72 min-h-[200px] max-h-[300px] flex flex-col cursor-move select-none"
              onMouseDown={(e) => handleMouseDown(note.id, e)}
              style={{ 
                backgroundColor: note.color,
                transform: `translate(${notePositions[note.id]?.x || Math.random() * 200}px, ${notePositions[note.id]?.y || 100 + Math.random() * 100}px)`,
                transition: draggedNote?.id === note.id ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              {/* Color Picker */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-1">
                  {noteColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => updateNoteColor(note.id, color.value)}
                      className="w-6 h-6 rounded-full border-2 border-gray-400 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 hover:bg-black/10 rounded transition-colors"
                  title="Delete note"
                >
                  <Trash2 size={16} className="text-gray-700" />
                </button>
              </div>

              {/* Note Content */}
              <textarea
                value={note.content}
                onChange={(e) => updateNote(note.id, e.target.value)}
                placeholder="Write your note here..."
                className="flex-1 bg-transparent border-none outline-none resize-none text-gray-900 placeholder-gray-600 text-sm leading-relaxed"
              />

              {/* Decorative Pin */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <div className="w-4 h-4 bg-red-500 rounded-full shadow-md"></div>
              </div>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-20">
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
              No sticky notes yet
            </p>
            <button
              onClick={addNote}
              className={`px-6 py-3 rounded-lg ${theme === 'bw' ? 'bg-black text-white hover:bg-gray-800' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors`}
            >
              Create Your First Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
