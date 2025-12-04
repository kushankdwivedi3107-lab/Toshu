import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Theme, CustomTheme } from '../App';

interface ThemeCustomizerProps {
  onClose: () => void;
  theme: Theme;
  customTheme: CustomTheme;
  onCustomThemeChange: (theme: CustomTheme) => void;
}

export function ThemeCustomizer({ onClose, theme, customTheme, onCustomThemeChange }: ThemeCustomizerProps) {
  const [localTheme, setLocalTheme] = useState<CustomTheme>(customTheme);

  const bgClass = theme === 'dark' ? 'bg-gray-800' : theme === 'bw' ? 'bg-white border-4 border-black' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const secondaryTextClass = theme === 'dark' ? 'text-gray-400' : theme === 'bw' ? 'text-gray-700' : 'text-gray-600';
  const inputClass = theme === 'dark' 
    ? 'bg-gray-700 border-gray-600 text-white' 
    : theme === 'bw'
    ? 'bg-white border-2 border-black'
    : 'bg-gray-50 border-gray-300';
  const buttonClass = theme === 'dark' 
    ? 'bg-gray-700 text-white hover:bg-gray-600' 
    : theme === 'bw'
    ? 'bg-white border-2 border-black hover:bg-black hover:text-white'
    : 'bg-gray-100 hover:bg-gray-200';

  const handleApply = () => {
    onCustomThemeChange(localTheme);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalTheme({ ...localTheme, backgroundImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const presetThemes = [
    { name: 'Classic Red', primaryColor: '#E53E3E', secondaryColor: '#319795', backgroundColor: '#F9FAFB', textColor: '#1F2937' },
    { name: 'Ocean Blue', primaryColor: '#3B82F6', secondaryColor: '#06B6D4', backgroundColor: '#EFF6FF', textColor: '#1E3A8A' },
    { name: 'Forest Green', primaryColor: '#10B981', secondaryColor: '#34D399', backgroundColor: '#F0FDF4', textColor: '#064E3B' },
    { name: 'Sunset Orange', primaryColor: '#F97316', secondaryColor: '#FB923C', backgroundColor: '#FFF7ED', textColor: '#7C2D12' },
    { name: 'Royal Purple', primaryColor: '#8B5CF6', secondaryColor: '#A78BFA', backgroundColor: '#F5F3FF', textColor: '#4C1D95' },
    { name: 'Rose Pink', primaryColor: '#EC4899', secondaryColor: '#F472B6', backgroundColor: '#FDF2F8', textColor: '#831843' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgClass} rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative`}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg ${buttonClass} transition-colors`}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className={`text-3xl ${textClass} mb-6`}>Customize Theme</h2>

        {/* Preset Themes */}
        <div className="mb-8">
          <h3 className={`text-lg ${textClass} mb-4`}>Preset Themes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presetThemes.map(preset => (
              <button
                key={preset.name}
                onClick={() => setLocalTheme(preset)}
                className={`p-4 rounded-lg border-2 transition-all ${buttonClass}`}
                style={{ 
                  borderColor: localTheme.primaryColor === preset.primaryColor ? preset.primaryColor : 'transparent',
                  backgroundColor: preset.backgroundColor 
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondaryColor }} />
                </div>
                <p className="text-sm" style={{ color: preset.textColor }}>{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="mb-8">
          <h3 className={`text-lg ${textClass} mb-4`}>Custom Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm ${secondaryTextClass} mb-2`}>Primary Color (Accent)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.primaryColor}
                  onChange={(e) => setLocalTheme({ ...localTheme, primaryColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.primaryColor}
                  onChange={(e) => setLocalTheme({ ...localTheme, primaryColor: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg border ${inputClass}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm ${secondaryTextClass} mb-2`}>Secondary Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.secondaryColor}
                  onChange={(e) => setLocalTheme({ ...localTheme, secondaryColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.secondaryColor}
                  onChange={(e) => setLocalTheme({ ...localTheme, secondaryColor: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg border ${inputClass}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm ${secondaryTextClass} mb-2`}>Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.backgroundColor}
                  onChange={(e) => setLocalTheme({ ...localTheme, backgroundColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.backgroundColor}
                  onChange={(e) => setLocalTheme({ ...localTheme, backgroundColor: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg border ${inputClass}`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm ${secondaryTextClass} mb-2`}>Text Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localTheme.textColor}
                  onChange={(e) => setLocalTheme({ ...localTheme, textColor: e.target.value })}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={localTheme.textColor}
                  onChange={(e) => setLocalTheme({ ...localTheme, textColor: e.target.value })}
                  className={`flex-1 px-3 py-2 rounded-lg border ${inputClass}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Background Image */}
        <div className="mb-8">
          <h3 className={`text-lg ${textClass} mb-4`}>Background Image</h3>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="bgImageUpload"
            />
            <label htmlFor="bgImageUpload" className="cursor-pointer">
              <Upload size={32} className={`mx-auto mb-2 ${secondaryTextClass}`} />
              <p className={secondaryTextClass}>Click to upload background image</p>
              {localTheme.backgroundImage && (
                <p className={`text-sm ${textClass} mt-2`}>Image uploaded ✓</p>
              )}
            </label>
            {localTheme.backgroundImage && (
              <button
                onClick={() => setLocalTheme({ ...localTheme, backgroundImage: undefined })}
                className={`mt-3 px-4 py-2 rounded-lg ${buttonClass}`}
              >
                Remove Image
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <h3 className={`text-lg ${textClass} mb-4`}>Preview</h3>
          <div 
            className="p-6 rounded-lg border-2"
            style={{ 
              backgroundColor: localTheme.backgroundColor,
              borderColor: localTheme.primaryColor,
              backgroundImage: localTheme.backgroundImage ? `url(${localTheme.backgroundImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <h4 style={{ color: localTheme.textColor }} className="text-xl mb-2">Sample Text</h4>
            <p style={{ color: localTheme.textColor }} className="mb-3">This is how your text will look.</p>
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded" style={{ backgroundColor: localTheme.primaryColor, color: 'white' }}>
                Primary Button
              </div>
              <div className="px-4 py-2 rounded" style={{ backgroundColor: localTheme.secondaryColor, color: 'white' }}>
                Secondary Button
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-6 py-3 rounded-lg ${buttonClass} transition-colors`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className={`px-6 py-3 rounded-lg ${theme === 'bw' ? 'bg-black text-white hover:bg-gray-800' : 'bg-red-500 text-white hover:bg-red-600'} transition-colors`}
          >
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
}
