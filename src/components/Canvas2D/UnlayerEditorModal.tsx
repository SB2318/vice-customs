import React, { useRef } from 'react';
import FilerobotImageEditor from '@unlayer/react-image-editor';
import { X, Check, Image as ImageIcon } from 'lucide-react';

interface UnlayerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSaveEditedImage: (dataUrl: string) => void;
}

export const UnlayerEditorModal: React.FC<UnlayerEditorModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onSaveEditedImage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#0c0c16] border-2 border-vice-cyan rounded-2xl shadow-neon-cyan flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-[#101020] border-b border-vice-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-vice-cyan/20 border border-vice-cyan flex items-center justify-center text-vice-cyan">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-vice text-white tracking-wider">
                UNLAYER REACT IMAGE EDITOR
              </h2>
              <p className="text-xs text-gray-400">
                Advanced crop, draw, filters, text & shape tools for vehicle livery templates
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Unlayer React Image Editor Integration */}
        <div className="flex-1 w-full h-full relative bg-black overflow-hidden">
          <FilerobotImageEditor
            image={imageUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="%23ff007f"/><text x="512" y="512" font-size="48" fill="white" text-anchor="middle">VICE CUSTOMS UV TEMPLATE</text></svg>'}
            onSave={(res: any) => {
              if (res?.dataUrl) {
                onSaveEditedImage(res.dataUrl);
              }
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
