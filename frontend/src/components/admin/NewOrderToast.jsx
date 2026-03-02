// NewOrderToast — clean, minimal slide-in notification. No emojis.
export default function NewOrderToast({ show }) {
    if (!show) return null;
    return (
        <div className="fixed top-5 right-5 z-[100] flex items-start gap-3 bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 w-72 new-order-toast">
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">New Order Received</p>
                <p className="text-xs text-gray-500 mt-0.5">Check the Orders page</p>
            </div>
        </div>
    );
}
