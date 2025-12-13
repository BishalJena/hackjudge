'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TypeShuffleProps {
    text: string;
    className?: string;
    trigger?: boolean;
    delay?: number;
    speed?: number;
    onComplete?: () => void;
}

// "Matrix" / Terminal style characters
const CHARS = '!<>-_\\/[]{}—=+*^?#________';

export function TypeShuffle({
    text,
    className = '',
    trigger = true,
    delay = 0,
    speed = 40,
    onComplete
}: TypeShuffleProps) {
    const [display, setDisplay] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const frameRef = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const shuffle = useCallback(() => {
        if (!trigger) return;

        setIsAnimating(true);
        const chars = text.split('');
        const resolved = new Array(chars.length).fill(false);
        let frame = 0;

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            frame++;
            frameRef.current = frame;

            // Build display string
            const output = chars.map((char, i) => {
                // Space stays space
                if (char === ' ') return ' ';

                // Already resolved
                if (resolved[i]) return char;

                // Random chance to resolve based on frame and index
                // This creates a "wave" effect from left to right
                const shouldResolve = frame > (i * 2) + 10;

                if (shouldResolve) {
                    resolved[i] = true;
                    return char;
                }

                // Random shuffle character
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join('');

            setDisplay(output);

            // All resolved?
            if (resolved.every(Boolean)) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setIsAnimating(false);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [text, trigger, speed, onComplete]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (trigger) {
            timeout = setTimeout(shuffle, delay);
        }
        return () => {
            clearTimeout(timeout);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [shuffle, delay, trigger]);

    return (
        <span className={`font-mono inline-block ${className} ${isAnimating ? 'text-terminal-green' : ''}`}>
            {display || (trigger ? '' : text)}
        </span>
    );
}
