import { useState, useRef, useEffect } from 'react';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function MarkAsDropdown({ currentStatus, onSelect, loading }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (value) => {
        setOpen(false);
        if (value !== currentStatus) onSelect(value);
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
                {loading ? (
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <span>Mark As</span>
                )}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                    {STATUS_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleSelect(opt.value)}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer
                                ${opt.value === currentStatus
                                    ? 'bg-gray-50 text-gray-400 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
