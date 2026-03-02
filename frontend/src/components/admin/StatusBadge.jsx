// StatusBadge — color-coded pill badge for order statuses
export default function StatusBadge({ status }) {
    const map = {
        pending: 'bg-amber-50   text-amber-700   ring-amber-200',
        confirmed: 'bg-blue-50    text-blue-700    ring-blue-200',
        on_hold: 'bg-orange-50  text-orange-700  ring-orange-200',
        fulfilled: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        cancelled: 'bg-red-50     text-red-700     ring-red-200',
        draft: 'bg-gray-50    text-gray-500    ring-gray-200',
    };
    const cls = map[status] || map.draft;
    const label = status?.replace('_', ' ') ?? 'unknown';
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset capitalize ${cls}`}
        >
            {label}
        </span>
    );
}
