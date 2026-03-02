import { memo } from 'react';
import { formatCurrency } from '../../utils/helpers';

function PackageSelector({ packages, selected, onSelect }) {
    if (!packages || packages.length === 0) return null;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Choose Your Deal</label>
            <div className="grid gap-2">
                {packages.map((pkg, i) => {
                    const isSelected = selected?.qty === pkg.qty;
                    const isBestDeal = pkg.tag === 'Best Deal';

                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onSelect(pkg)}
                            className={`
                relative flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left
                ${isSelected
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                    : 'border-border hover:border-primary/40 bg-card'
                                }
              `}
                        >
                            <div className="flex items-center gap-3">
                                {/* Radio indicator */}
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-primary' : 'border-muted-foreground/30'}`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                </div>
                                <div>
                                    <span className="font-semibold text-sm text-card-foreground">{pkg.label}</span>
                                    {pkg.tag && (
                                        <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${isBestDeal
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-primary/10 text-primary'
                                            }`}>
                                            {pkg.tag}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-card-foreground">{formatCurrency(pkg.price)}</span>
                                {pkg.qty > 1 && (
                                    <p className="text-xs text-muted-foreground">
                                        {formatCurrency(pkg.price / pkg.qty)} each
                                    </p>
                                )}
                            </div>

                            {isBestDeal && (
                                <div className="absolute -top-2.5 right-3 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    MOST POPULAR
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default memo(PackageSelector);
