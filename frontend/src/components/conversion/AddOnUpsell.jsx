import { memo } from 'react';
import { formatCurrency } from '../../utils/helpers';

function AddOnUpsell({ addOn, selected, onToggle }) {
    if (!addOn) return null;

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`
        w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left
        ${selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 bg-card'
                }
      `}
        >
            {/* Checkbox */}
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${selected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                {selected && (
                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                )}
            </div>

            <span className="text-lg">🎁</span>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground">
                    Add {addOn.name}
                </p>
                <p className="text-xs text-muted-foreground">
                    Complement your purchase
                </p>
            </div>

            <span className="font-bold text-sm text-primary shrink-0">
                +{formatCurrency(addOn.price)}
            </span>
        </button>
    );
}

export default memo(AddOnUpsell);
