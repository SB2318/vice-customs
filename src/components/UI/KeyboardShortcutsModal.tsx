import React from 'react';
import { X, Keyboard, Command, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTour?: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['Ctrl', 'Z'], description: 'Undo last change', category: 'Editing' },
  { keys: ['Ctrl', 'Y'], description: 'Redo change (Windows)', category: 'Editing' },
  { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo change (Mac/Cross)', category: 'Editing' },
  { keys: ['Delete', 'Backspace'], description: 'Remove active decal', category: 'Editing' },
  { keys: ['1', '2', '3', '4', '5', '6'], description: 'Switch camera angles (3/4, Front, Side, Rear, Top, Rims)', category: '3D Studio' },
  { keys: ['R'], description: 'Rev engine & exhaust flame burst', category: 'Studio FX' },
  { keys: ['U'], description: 'Toggle neon underglow lights', category: 'Studio FX' },
  { keys: ['G'], description: 'Toggle 2D UV wireframe panel guides', category: '2D Canvas' },
  { keys: ['?'], description: 'Show Keyboard Shortcuts & Guide', category: 'General' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onOpenTour
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#0d0d1a] border-2 border-vice-cyan rounded-3xl shadow-neon-cyan p-5 sm:p-6 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vice-border pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-vice-cyan/20 border border-vice-cyan flex items-center justify-center text-vice-cyan shadow-neon-cyan">
              <Keyboard size={20} />
            </div>
            <div>
              <h2 className="text-base font-vice text-white tracking-wider">
                KEYBOARD SHORTCUTS
              </h2>
              <p className="text-xs text-gray-400">
                Speed up your livery studio workflow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-xl hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2.5 my-2">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-[#141426] border border-vice-border rounded-xl text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-vice text-vice-cyan uppercase tracking-wider w-20">
                  {item.category}
                </span>
                <span className="text-gray-200">{item.description}</span>
              </div>

              <div className="flex items-center gap-1">
                {item.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2 py-1 bg-black/80 border border-gray-700 text-vice-pink font-mono text-[11px] font-bold rounded-lg shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-vice-border">
          {onOpenTour ? (
            <button
              onClick={() => {
                onClose();
                onOpenTour();
              }}
              className="text-xs font-vice text-vice-pink hover:underline flex items-center gap-1 font-bold"
            >
              <Sparkles size={14} /> Open CHIP-86 Bot Tour 🤖
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-vice-cyan text-black font-vice text-xs font-bold rounded-xl hover:bg-cyan-300 shadow-neon-cyan"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
