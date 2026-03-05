// NewOrderToast — premium slide-in notification matching new design
export default function NewOrderToast({ show }) {
    if (!show) return null;
    return (
        <div
            className="fixed top-5 right-5 z-[100] flex items-start gap-3 rounded-2xl px-4 py-3.5 w-72 new-order-toast"
            style={{
                background: 'white',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
                border: '1px solid #E5E7EB',
            }}
        >
            <div
                className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: '#ECFDF5' }}
            >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: '#1E293B' }}>New Order Received</p>
                <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>A new order just came in</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1 shrink-0" />
        </div>
    );
}
