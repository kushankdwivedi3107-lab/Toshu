import { ToshuLogo } from './ToshuLogo';
import { 
  PenLine, 
  Library, 
  StickyNote, 
  AlignLeft, 
  FileCheck, 
  Settings,
  Clock as ClockIcon
} from 'lucide-react';
import { Theme } from '../App';

const menuItems = [
  { id: 'write', label: 'Write', icon: PenLine, active: true },
  { id: 'library', label: 'Library', icon: Library, active: false },
  { id: 'notes', label: 'Notes', icon: StickyNote, active: false },
  { id: 'outline', label: 'Outline', icon: AlignLeft, active: false },
  { id: 'review', label: 'Review', icon: FileCheck, active: false },
  { id: 'clock', label: 'Clock', icon: ClockIcon, active: false },
  { id: 'settings', label: 'Settings', icon: Settings, active: false },
];

interface SidebarProps {
  isOpen: boolean;
  theme: Theme;
  onShowClock: () => void;
  onShowStickyNotes: () => void;
  hasWallpaper?: boolean;
}

export function Sidebar({ isOpen, theme, onShowClock, onShowStickyNotes, hasWallpaper }: SidebarProps) {
  const bgClass = hasWallpaper
    ? 'bg-white/95 backdrop-blur-md border-gray-200/50'
    : theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : theme === 'bw' 
    ? 'bg-white border-2 border-black' 
    : theme === 'paper'
    ? 'bg-[#F5E6D3]/95 backdrop-blur-sm border-amber-900/20'
    : 'bg-gray-100 border-gray-200';
  const textClass = theme === 'dark' ? 'text-white' : theme === 'paper' ? 'text-amber-900' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-400' : theme === 'bw' ? 'text-gray-700' : theme === 'paper' ? 'text-amber-700' : 'text-gray-500';
  const activeBg = theme === 'dark' ? 'bg-gray-700' : theme === 'bw' ? 'bg-black text-white' : theme === 'paper' ? 'bg-amber-100' : 'bg-white';
  const inactiveBg = theme === 'dark' ? 'hover:bg-gray-700' : theme === 'bw' ? 'hover:bg-gray-200' : theme === 'paper' ? 'hover:bg-amber-50' : 'hover:bg-gray-50';
  const borderColor = theme === 'bw' ? 'border-black' : theme === 'paper' ? 'border-amber-900' : 'border-red-500';

  const handleClick = (id: string) => {
    if (id === 'clock') {
      onShowClock();
    } else if (id === 'notes') {
      onShowStickyNotes();
    }
  };

  return (
    <div 
      className={`
        w-64 ${bgClass} border-r flex flex-col h-full
        transition-transform duration-300 ease-in-out shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Branding */}
      <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : theme === 'bw' ? 'border-black' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-2">
          <ToshuLogo />
          <span className={`text-xl ${textClass}`}>Toshu</span>
        </div>
        <p className={`text-xs ${secondaryTextClass} ml-11`}>Research writing environment</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all
                ${item.active 
                  ? `${activeBg} ${theme === 'bw' ? 'text-white' : textClass} shadow-sm border-l-4 ${borderColor}` 
                  : `${theme === 'dark' ? 'text-gray-300' : theme === 'bw' ? 'text-black' : 'text-gray-600'} ${inactiveBg}`
                }
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}