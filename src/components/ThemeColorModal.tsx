import React from 'react';
import { THEME_OPTIONS, ThemeColor, ThemeOption } from '../lib/theme';
import { Palette, Check, X, Sparkles, Sun, Moon } from 'lucide-react';

interface ThemeColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
}

export const ThemeColorModal: React.FC<ThemeColorModalProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  const currentTheme = THEME_OPTIONS.find((t) => t.id === activeTheme) || THEME_OPTIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs text-xl shrink-0"
              style={{ backgroundColor: currentTheme.primaryColor }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <span>App Theme & Atmosphere</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Transforms full app background, card tones, and all UI accents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme List / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-[65vh] overflow-y-auto pr-1">
          {THEME_OPTIONS.map((theme: ThemeOption) => {
            const isSelected = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onSelectTheme(theme.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-2 shadow-md bg-slate-50/80 dark:bg-slate-800/80'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/40 dark:hover:bg-slate-800/40'
                }`}
                style={{
                  borderColor: isSelected ? theme.primaryColor : undefined,
                }}
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{theme.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {theme.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {theme.tagline}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shrink-0 shadow-xs"
                      style={{ backgroundColor: theme.primaryColor }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Color Swatches (Shows Backgrounds + Accent) */}
                <div className="my-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Canvas:</span>
                    {/* Light BG swatch */}
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs" 
                      style={{ backgroundColor: theme.lightBg }}
                      title={`Light Canvas: ${theme.lightBg}`}
                    />
                    {/* Dark BG swatch */}
                    <div 
                      className="w-4 h-4 rounded-full border border-slate-500 dark:border-slate-700 shadow-2xs" 
                      style={{ backgroundColor: theme.darkBg }}
                      title={`Dark Canvas: ${theme.darkBg}`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Accent:</span>
                    {/* Primary color accent swatch */}
                    <div 
                      className="w-4 h-4 rounded-full shadow-2xs" 
                      style={{ backgroundColor: theme.primaryColor }}
                      title={`Primary Accent: ${theme.primaryColor}`}
                    />
                  </div>
                </div>

                {/* Progress bar gradient preview */}
                <div className="w-full space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400">
                    <span>Accent Gradient</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${theme.progressBarGradient}`}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info tip */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.primaryColor }} />
            <span>Adapts dynamically across both Light & Dark modes</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl font-bold text-white text-xs cursor-pointer shadow-xs transition-opacity hover:opacity-90"
            style={{ backgroundColor: currentTheme.primaryColor }}
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
