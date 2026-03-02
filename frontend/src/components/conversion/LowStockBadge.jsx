import { useMemo, memo } from 'react';

function LowStockBadge({ productId }) {
  const stock = useMemo(() => {
    const seed = productId * 7 + 3;
    return (seed % 8) + 3;
  }, [productId]);

  return (
    <div className="flex items-center gap-1.5 animate-blink">
      <span className="text-sm font-bold text-red-800">
        ⚠️ Hurry! Only {stock} pieces left
      </span>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-blink {
          animation: blink 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default memo(LowStockBadge);
