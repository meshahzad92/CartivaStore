import { memo } from 'react';

function Input({
    label,
    id,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    className = '',
    ...props
}) {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-foreground">
                    {label}
                    {required && <span className="text-destructive ml-0.5">*</span>}
                </label>
            )}
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`
          w-full px-4 py-2.5 rounded-lg border bg-background text-foreground
          placeholder:text-muted-foreground
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
          ${error ? 'border-destructive' : 'border-input'}
        `}
                {...props}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

export default memo(Input);
