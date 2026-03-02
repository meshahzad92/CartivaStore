import { memo } from 'react';

const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
    ghost: 'text-foreground hover:bg-muted'
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg'
};

function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    type = 'button',
    onClick,
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
        inline-flex items-center justify-center gap-2 font-semibold
        rounded-lg transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}

export default memo(Button);
