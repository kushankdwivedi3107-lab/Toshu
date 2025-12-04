import { 
  Bold, 
  Italic, 
  Underline, 
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Save
} from 'lucide-react';
import { Theme } from '../App';

interface ToolbarProps {
  theme: Theme;
  hasWallpaper?: boolean;
  onSave?: () => void;
}

export function Toolbar({ theme, hasWallpaper, onSave }: ToolbarProps) {
  const bgClass = hasWallpaper
    ? 'bg-white/95 backdrop-blur-md border-gray-200/50'
    : theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : theme === 'bw' 
    ? 'bg-white border-black' 
    : theme === 'paper'
    ? 'bg-[#F5E6D3]/95 backdrop-blur-sm border-amber-900/20'
    : 'bg-white border-gray-200';
  const buttonClass = theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : theme === 'bw' ? 'text-black hover:bg-gray-200' : theme === 'paper' ? 'text-amber-900 hover:bg-amber-100' : 'text-gray-700 hover:bg-gray-100';
  const selectClass = theme === 'dark' 
    ? 'border-gray-600 text-gray-200 bg-gray-700 hover:bg-gray-600' 
    : theme === 'bw'
    ? 'border-2 border-black text-black bg-white hover:bg-gray-100'
    : theme === 'paper'
    ? 'border-amber-900/30 text-amber-900 bg-amber-50 hover:bg-amber-100'
    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50';
  const dividerClass = theme === 'dark' ? 'bg-gray-600' : theme === 'bw' ? 'bg-black' : theme === 'paper' ? 'bg-amber-900/30' : 'bg-gray-300';

  return (
    <div className={`${bgClass} border-b px-6 py-3 shadow-sm`}>
      <div className="flex items-center gap-4">
        {/* Save Button */}
        <button 
          onClick={onSave}
          className={`p-2 ${buttonClass} rounded-lg transition-colors flex items-center gap-2`}
          title="Save (Ctrl+S)"
        >
          <Save size={18} />
          <span className="text-sm hidden md:inline">Save</span>
        </button>

        <div className={`w-px h-6 ${dividerClass}`}></div>

        {/* Font Family */}
        <select
          onChange={(e) => document.execCommand('fontName', false, e.currentTarget.value)}
          className={`px-3 py-1.5 border ${selectClass} rounded-lg text-sm`}
        >
          <option>Times New Roman</option>
          <option>Arial</option>
          <option>Calibri</option>
          <option>Georgia</option>
        </select>

        {/* Font Size */}
        <select
          defaultValue="12"
          onChange={(e) => {
            // Map font-size px to execCommand fontSize values (1-7)
            const v = parseInt(e.currentTarget.value, 10);
            let size = '3';
            if (v <= 10) size = '2';
            else if (v <= 12) size = '3';
            else if (v <= 14) size = '4';
            else if (v <= 16) size = '5';
            else if (v <= 18) size = '6';
            else size = '7';
            document.execCommand('fontSize', false, size);
          }}
          className={`px-3 py-1.5 border ${selectClass} rounded-lg text-sm w-20`}
        >
          <option>10</option>
          <option>11</option>
          <option>12</option>
          <option>14</option>
          <option>16</option>
          <option>18</option>
        </select>

        <div className={`w-px h-6 ${dividerClass}`}></div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <button onClick={() => document.execCommand('bold')} className={`p-2 ${buttonClass} rounded-lg transition-colors`} title="Bold">
            <Bold size={18} />
          </button>
          <button onClick={() => document.execCommand('italic')} className={`p-2 ${buttonClass} rounded-lg transition-colors`} title="Italic">
            <Italic size={18} />
          </button>
          <button onClick={() => document.execCommand('underline')} className={`p-2 ${buttonClass} rounded-lg transition-colors`} title="Underline">
            <Underline size={18} />
          </button>
        </div>

        <div className={`w-px h-6 ${dividerClass}`}></div>

        {/* Colors */}
        <div className="flex items-center gap-1">
          <button className={`p-2 ${buttonClass} rounded-lg transition-colors`}>
            <Palette size={18} />
          </button>
          <button className={`p-2 ${buttonClass} rounded-lg transition-colors`}>
            <Highlighter size={18} />
          </button>
        </div>

        <div className={`w-px h-6 ${dividerClass}`}></div>

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <button onClick={() => document.execCommand('justifyLeft')} className={`p-2 ${buttonClass} rounded-lg transition-colors`} title="Align Left">
            <AlignLeft size={18} />
          </button>
          <button onClick={() => document.execCommand('justifyCenter')} className={`p-2 ${buttonClass} rounded-lg transition-colors`} title="Align Center">
            <AlignCenter size={18} />
          </button>
          <button onClick={() => document.execCommand('justifyRight')} className={`p-2 ${buttonClass} rounded-lg transition-colors`} title="Align Right">
            <AlignRight size={18} />
          </button>
          <button onClick={() => document.execCommand('justifyFull')} className={`p-2 ${buttonClass} rounded-lg transition-colors`} title="Justify">
            <AlignJustify size={18} />
          </button>
        </div>

        <div className={`w-px h-6 ${dividerClass}`}></div>

        {/* Line Spacing */}
        <select defaultValue="1.5" className={`px-3 py-1.5 border ${selectClass} rounded-lg text-sm`}>
          <option>1.0</option>
          <option>1.15</option>
          <option>1.5</option>
          <option>2.0</option>
        </select>
      </div>
    </div>
  );
}