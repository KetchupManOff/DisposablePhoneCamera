import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative w-full sm:max-w-md max-h-[85vh] bg-vintage-surface border border-vintage-border/40 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-vintage-border/20">
            <h3 className="font-display text-vintage-text">{title}</h3>
            <button
              onClick={onClose}
              className="text-vintage-muted hover:text-vintage-text transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="p-4 border-t border-vintage-border/20">{footer}</div>
        )}
      </div>
    </div>
  );
}