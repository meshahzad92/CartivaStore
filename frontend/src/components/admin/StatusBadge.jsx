// StatusBadge — premium pill badge matching new design system
export default function StatusBadge({ status }) {
    const styles = {
        pending: { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
        confirmed: { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
        on_hold: { bg: '#FFEDD5', color: '#9A3412', dot: '#F97316' },
        fulfilled: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
        cancelled: { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
        booked: { bg: '#ECFEFF', color: '#155E75', dot: '#06B6D4' },
    };
    const s = styles[status] ?? { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' };
    const label = status?.replace('_', ' ') ?? 'unknown';
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
            style={{ background: s.bg, color: s.color }}
        >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
            {label}
        </span>
    );
}
