import { useState, useEffect, memo } from 'react';

function LiveViewerCount() {
    const [count, setCount] = useState(() => Math.floor(Math.random() * 16) + 5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(Math.floor(Math.random() * 16) + 5);
        }, 15000 + Math.random() * 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-1.5 text-sm">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="text-red-600 font-bold">
                {count} people are viewing this right now
            </span>
        </div>
    );
}

export default memo(LiveViewerCount);
