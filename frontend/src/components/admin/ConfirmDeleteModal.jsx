import { createPortal } from 'react-dom';

export default function ConfirmDeleteModal({ count, onConfirm, onCancel, loading }) {
    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                onClick={!loading ? onCancel : undefined}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Red top accent */}
                <div className="h-1 bg-red-500 w-full" />

                <div className="p-6">
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>

                    <h2 className="text-[15px] font-bold text-gray-900 mb-1">
                        Delete {count} {count === 1 ? 'Order' : 'Orders'}?
                    </h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        This action cannot be undone. The selected {count === 1 ? 'order' : 'orders'} and all associated items will be permanently removed.
                    </p>

                    <div className="flex items-center gap-2 mt-6">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Deleting…
                                </>
                            ) : (
                                `Delete ${count === 1 ? 'Order' : 'Orders'}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
