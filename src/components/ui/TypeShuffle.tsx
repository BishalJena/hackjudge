'use client';

import { useState, useEffect, useRef } from 'react';

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
    const hasAnimatedRef = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Only animate ONCE per component lifetime
        if (hasAnimatedRef.current || !trigger) {
            setDisplay(text);
            return;
        }

        hasAnimatedRef.current = true;

        const timeout = setTimeout(() => {
            setIsAnimating(true);
            const chars = text.split('');
            const resolved = new Array(chars.length).fill(false);
            let frame = 0;

            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(() => {
                frame++;

                const output = chars.map((char, i) => {
                    if (char === ' ') return ' ';
                    if (resolved[i]) return char;

                    const shouldResolve = frame > (i * 2) + 10;

                    if (shouldResolve) {
                        resolved[i] = true;
                        return char;
                    }

                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                }).join('');

                setDisplay(output);

                if (resolved.every(Boolean)) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setIsAnimating(false);
                    if (onComplete) onComplete();
                }
            }, speed);
        }, delay);

        return () => {
            clearTimeout(timeout);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - only run once on mount

    return (
        <span className={`font-mono inline-block ${className} ${isAnimating ? 'text-terminal-green' : ''}`}>
            {display || text}
        </span>
    );
}

