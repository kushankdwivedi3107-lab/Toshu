import { Save, Download, Palette } from 'lucide-react';
import { Theme } from '../App';

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onShowThemeCustomizer: () => void;
  hasWallpaper?: boolean;
}

export function Header({ theme, onThemeChange, onShowThemeCustomizer, hasWallpaper }: HeaderProps) {
  const bgClass = hasWallpaper 
    ? 'bg-white/95 backdrop-blur-md border-gray-200/50'
    : theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : theme === 'bw' 
    ? 'bg-white border-black' 
    : theme === 'paper'
    ? 'bg-[#F5E6D3]/95 backdrop-blur-sm border-amber-900/20'
    : 'bg-white border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : theme === 'paper' ? 'text-amber-900' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-300' : theme === 'bw' ? 'text-black' : theme === 'paper' ? 'text-amber-800' : 'text-gray-700';
  const buttonClass = theme === 'dark' 
    ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
    : theme === 'bw'
    ? 'bg-white border-2 border-black text-black hover:bg-black hover:text-white'
    : theme === 'paper'
    ? 'bg-amber-50 border-amber-900/30 text-amber-900 hover:bg-amber-100'
    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';
  
  const pillClass = theme === 'dark'
    ? 'bg-teal-900 text-teal-200 border-teal-700'
    : theme === 'bw'
    ? 'bg-white text-black border-2 border-black'
    : theme === 'paper'
    ? 'bg-amber-100 text-amber-900 border-amber-900/30'
    : 'bg-teal-50 text-teal-700 border-teal-200';

  return (
    <div className={`${bgClass} border-b px-6 py-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        {/* Document Title & Status */}
        <div className="flex items-center gap-4">
          <input 
            type="text"
            defaultValue="Manuscript: Cognitive Load in Digital Learning"
            className={`text-lg ${textClass} border-none outline-none bg-transparent`}
          />
          <span className={`px-3 py-1 ${pillClass} text-xs rounded-full border`}>
            Draft
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="flex items-center gap-1 mr-2">
            <Palette size={16} className={secondaryTextClass} />
            <select 
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as Theme)}
              className={`px-3 py-2 ${buttonClass} rounded-lg transition-colors text-sm`}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="bw">Black & White</option>
              <option value="paper">Paper (Kindle)</option>
            </select>
          </div>

          <button 
            onClick={onShowThemeCustomizer}
            className={`px-3 py-2 ${buttonClass} rounded-lg transition-colors text-sm`}
            title="Customize Theme"
          >
            Customize
          </button>

          <button className={`px-4 py-2 ${buttonClass} rounded-lg transition-colors flex items-center gap-2`}>
            <Save size={16} />
            Save
          </button>
          <button className={`px-4 py-2 ${theme === 'bw' ? 'bg-black text-white hover:bg-gray-800' : theme === 'paper' ? 'bg-amber-900 text-white hover:bg-amber-800' : 'bg-red-500 text-white hover:bg-red-600'} rounded-lg transition-colors flex items-center gap-2`}>
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}