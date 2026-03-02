import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ isOpen, onClose, title, children }) {
    const handleEscape = useCallback(
        (e) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative bg-card text-card-foreground rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                    {title && <h2 className="text-lg font-semibold">{title}</h2>}
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-muted transition-colors ml-auto cursor-pointer"
                        aria-label="Close modal"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}
