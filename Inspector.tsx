import { useState } from 'react';
import { BarChart3, Check, MessageSquare } from 'lucide-react';
import { Theme, Stats, GrammarIssue } from '../App';

type Tab = 'stats' | 'grammar' | 'comments';

interface InspectorProps {
  isOpen: boolean;
  theme: Theme;
  hasWallpaper?: boolean;
  stats?: Stats;
  grammarIssues?: GrammarIssue[];
}

export function Inspector({ isOpen, theme, hasWallpaper, stats, grammarIssues = [] }: InspectorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('stats');

  const bgClass = hasWallpaper
    ? 'bg-white/95 backdrop-blur-md border-gray-200/50'
    : theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : theme === 'bw' 
    ? 'bg-white border-2 border-black' 
    : theme === 'paper'
    ? 'bg-[#F5E6D3]/95 backdrop-blur-sm border-amber-900/20'
    : 'bg-white border-gray-200';
  const tabBgClass = theme === 'dark' ? 'bg-gray-900' : theme === 'bw' ? 'bg-gray-100' : theme === 'paper' ? 'bg-amber-50' : 'bg-gray-50';
  const activeTabClass = theme === 'dark' ? 'bg-gray-800 text-red-400' : theme === 'bw' ? 'bg-white text-black border-b-4' : theme === 'paper' ? 'bg-[#F5E6D3] text-amber-900' : 'bg-white text-red-500';
  const inactiveTabClass = theme === 'dark' ? 'text-gray-400 hover:bg-gray-800' : theme === 'bw' ? 'text-black hover:bg-white' : theme === 'paper' ? 'text-amber-800 hover:bg-amber-100' : 'text-gray-600 hover:bg-gray-100';
  const textClass = theme === 'dark' ? 'text-gray-100' : theme === 'paper' ? 'text-amber-900' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-400' : theme === 'bw' ? 'text-gray-700' : theme === 'paper' ? 'text-amber-700' : 'text-gray-600';

  return (
    <div 
      className={`
        w-80 h-full ${bgClass} border-l flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}
      `}
      style={{
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      {/* Tabs */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : theme === 'bw' ? 'border-black' : theme === 'paper' ? 'border-amber-900/20' : 'border-gray-200'} ${tabBgClass}`}>
        <div className="flex">
          <button
            onClick={() => setActiveTab('stats')}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all
              ${activeTab === 'stats' 
                ? `${activeTabClass} border-b-2 ${theme === 'bw' ? 'border-black' : theme === 'paper' ? 'border-amber-900' : 'border-red-500'}` 
                : inactiveTabClass
              }
            `}
          >
            <BarChart3 size={18} />
            Stats
          </button>
          <button
            onClick={() => setActiveTab('grammar')}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all
              ${activeTab === 'grammar' 
                ? `${activeTabClass} border-b-2 ${theme === 'bw' ? 'border-black' : theme === 'paper' ? 'border-amber-900' : 'border-red-500'}` 
                : inactiveTabClass
              }
            `}
          >
            <Check size={18} />
            Grammar
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-all
              ${activeTab === 'comments' 
                ? `${activeTabClass} border-b-2 ${theme === 'bw' ? 'border-black' : theme === 'paper' ? 'border-amber-900' : 'border-red-500'}` 
                : inactiveTabClass
              }
            `}
          >
            <MessageSquare size={18} />
            Comments
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'stats' && <StatsContent theme={theme} textClass={textClass} secondaryTextClass={secondaryTextClass} stats={stats} />}
        {activeTab === 'grammar' && <GrammarContent theme={theme} textClass={textClass} secondaryTextClass={secondaryTextClass} grammarIssues={grammarIssues} />}
        {activeTab === 'comments' && <CommentsContent theme={theme} textClass={textClass} secondaryTextClass={secondaryTextClass} />}
      </div>
    </div>
  );
}

function StatsContent({ theme, textClass, secondaryTextClass, stats }: { theme: Theme; textClass: string; secondaryTextClass: string; stats?: Stats }) {
  const statsList = stats ? [
    { label: 'Words', value: stats.wordCount.toLocaleString() },
    { label: 'Characters', value: stats.characterCount.toLocaleString() },
    { label: 'Pages', value: stats.pageCount.toString() },
    { label: 'Reading Time', value: stats.readingTime },
  ] : [
    { label: 'Words', value: '0' },
    { label: 'Characters', value: '0' },
    { label: 'Pages', value: '0' },
    { label: 'Reading Time', value: '0 min' },
  ];

  const cardBg = theme === 'dark' ? 'bg-gray-700' : theme === 'bw' ? 'bg-gray-100 border-2 border-black' : theme === 'paper' ? 'bg-amber-50 border border-amber-900/20' : 'bg-gray-50';
  const infoBg = theme === 'dark' ? 'bg-teal-900 border-teal-700 text-teal-200' : theme === 'bw' ? 'bg-white border-2 border-black text-black' : theme === 'paper' ? 'bg-amber-100 border border-amber-900/30 text-amber-900' : 'bg-teal-50 border-teal-200 text-teal-900';

  return (
    <div className="space-y-4">
      <h3 className={`${textClass} mb-4`}>Document Statistics</h3>
      <div className="space-y-3">
        {statsList.map((stat) => (
          <div key={stat.label} className={`flex justify-between items-center p-3 ${cardBg} rounded-lg`}>
            <span className={`${secondaryTextClass} text-sm`}>{stat.label}</span>
            <span className={textClass}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className={`mt-6 p-4 ${infoBg} border rounded-lg`}>
        <div className="flex items-start gap-3">
          <BarChart3 size={20} className={theme === 'dark' ? 'text-teal-400' : theme === 'bw' ? 'text-black' : theme === 'paper' ? 'text-amber-900' : 'text-teal-600'} />
          <div>
            <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-teal-200' : theme === 'bw' ? 'text-black' : theme === 'paper' ? 'text-amber-900' : 'text-teal-900'}`}>Reading Time</p>
            <p className={`text-xs ${theme === 'dark' ? 'text-teal-300' : theme === 'bw' ? 'text-gray-700' : theme === 'paper' ? 'text-amber-800' : 'text-teal-700'}`}>Approximately 7-9 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrammarContent({ theme, textClass, secondaryTextClass, grammarIssues }: { theme: Theme; textClass: string; secondaryTextClass: string; grammarIssues?: GrammarIssue[] }) {
  const issues = grammarIssues || [];

  const cardBg = theme === 'dark' ? 'bg-gray-700 border-gray-600' : theme === 'bw' ? 'bg-white border-2 border-black' : theme === 'paper' ? 'bg-amber-50 border border-amber-900/20' : 'bg-gray-50 border-gray-200';
  const buttonBg = theme === 'dark' ? 'bg-gray-600 border-gray-500 hover:bg-gray-500' : theme === 'bw' ? 'bg-white border-2 border-black hover:bg-black hover:text-white' : theme === 'paper' ? 'bg-white border border-amber-900/30 hover:bg-amber-100' : 'bg-white border-gray-300 hover:bg-gray-50';
  const primaryButtonBg = theme === 'bw' ? 'bg-black text-white hover:bg-gray-800' : theme === 'paper' ? 'bg-amber-900 text-white hover:bg-amber-800' : 'bg-red-500 text-white hover:bg-red-600';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className={textClass}>Grammar Check</h3>
        <span className={`px-2 py-1 ${theme === 'dark' ? 'bg-teal-900 text-teal-200' : theme === 'bw' ? 'bg-black text-white' : theme === 'paper' ? 'bg-amber-900 text-white' : 'bg-teal-50 text-teal-700'} text-xs rounded-full`}>
          {issues.length} suggestions
        </span>
      </div>

      <div className="space-y-3">
        {issues.length === 0 ? (
          <p className={`text-sm ${secondaryTextClass}`}>No grammar issues detected</p>
        ) : (
          issues.map((issue, index) => (
            <div key={index} className={`p-4 ${cardBg} rounded-lg border`}>
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-0.5 ${theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : theme === 'bw' ? 'bg-gray-200 text-black border border-black' : theme === 'paper' ? 'bg-amber-200 text-amber-900 border border-amber-900/30' : 'bg-yellow-100 text-yellow-800'} rounded`}>
                  {issue.type}
                </span>
                <span className={`text-xs px-2 py-0.5 ${theme === 'dark' ? 'bg-red-900 text-red-200' : theme === 'bw' ? 'bg-gray-200 text-black border border-black' : theme === 'paper' ? 'bg-red-100 text-red-900' : 'bg-red-100 text-red-700'} rounded`}>
                  {issue.severity}
                </span>
              </div>
              <p className={`text-sm mb-2 ${secondaryTextClass}`}>{issue.text}</p>
              <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-green-300' : theme === 'bw' ? 'text-green-700' : theme === 'paper' ? 'text-green-900' : 'text-green-600'}`}>Suggestion: {issue.suggestion}</p>
            </div>
          ))
        )}
      </div>

      {issues.length > 0 && (
        <div className={`mt-6 p-4 ${theme === 'dark' ? 'bg-blue-900/30 border border-blue-700' : theme === 'bw' ? 'bg-gray-100 border-2 border-black' : theme === 'paper' ? 'bg-blue-50 border border-blue-900/20' : 'bg-blue-50 border border-blue-200'} rounded-lg`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-blue-200' : theme === 'bw' ? 'text-black' : theme === 'paper' ? 'text-blue-900' : 'text-blue-700'}`}>
            Review these suggestions to improve your writing quality.
          </p>
        </div>
      )}
    </div>
  );
}

function CommentsContent({ theme, textClass, secondaryTextClass }: { theme: Theme; textClass: string; secondaryTextClass: string }) {
  const comments = [
    { 
      author: 'Dr. Sarah Chen', 
      text: 'Consider expanding this section with more recent literature.',
      time: '2 hours ago',
      section: 'Literature Review'
    },
    { 
      author: 'Prof. James Miller', 
      text: 'Excellent analysis. This could be a key contribution.',
      time: 'Yesterday',
      section: 'Discussion'
    },
  ];

  const cardBg = theme === 'dark' ? 'bg-gray-700' : theme === 'bw' ? 'bg-white border-2 border-l-8 border-black' : theme === 'paper' ? 'bg-amber-50 border-l-4 border-amber-900' : 'bg-gray-50';
  const borderColor = theme === 'bw' ? 'border-black' : theme === 'paper' ? 'border-amber-900' : 'border-teal-500';
  const buttonBg = theme === 'bw' ? 'bg-black text-white hover:bg-gray-800' : theme === 'paper' ? 'bg-amber-900 text-white hover:bg-amber-800' : 'bg-red-500 text-white hover:bg-red-600';
  const infoBg = theme === 'dark' ? 'bg-gray-700' : theme === 'bw' ? 'bg-white border-2 border-black' : theme === 'paper' ? 'bg-amber-50 border border-amber-900/20' : 'bg-gray-50';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className={textClass}>Comments</h3>
        <button className={`px-3 py-1 ${buttonBg} text-xs rounded`}>
          Add Comment
        </button>
      </div>

      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={index} className={`p-4 ${cardBg} rounded-lg ${theme !== 'bw' ? `border-l-4 ${borderColor}` : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <span className={`text-sm ${textClass}`}>{comment.author}</span>
              <span className={`text-xs ${secondaryTextClass}`}>{comment.time}</span>
            </div>
            <p className={`text-sm ${secondaryTextClass} mb-2`}>{comment.text}</p>
            <span className={`text-xs ${secondaryTextClass} italic`}>{comment.section}</span>
          </div>
        ))}
      </div>

      <div className={`mt-6 p-4 ${infoBg} rounded-lg`}>
        <p className={`text-xs ${secondaryTextClass} text-center`}>
          All comments saved automatically
        </p>
      </div>
    </div>
  );
}