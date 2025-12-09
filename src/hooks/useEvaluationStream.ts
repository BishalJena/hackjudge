/**
 * useEvaluationStream Hook
 * React hook for consuming SSE evaluation progress updates
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface EvaluationStep {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'complete' | 'failed';
}

export interface EvaluationProgress {
    jobId: string;
    executionId?: string;
    projectId?: string;
    mode: 'kestra' | 'mock';
    status: 'running' | 'complete' | 'failed';
    currentStep: number;
    totalSteps: number;
    steps: EvaluationStep[];
    progress: number;
    logs: string[];
}

interface UseEvaluationStreamOptions {
    jobId: string;
    executionId?: string;
    onComplete?: (data: EvaluationProgress) => void;
    onError?: (error: Error) => void;
}

interface UseEvaluationStreamReturn {
    progress: EvaluationProgress | null;
    isConnected: boolean;
    isComplete: boolean;
    error: Error | null;
    start: () => void;
    stop: () => void;
}

export function useEvaluationStream(
    options: UseEvaluationStreamOptions
): UseEvaluationStreamReturn {
    const { jobId, executionId, onComplete, onError } = options;

    const [progress, setProgress] = useState<EvaluationProgress | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const eventSourceRef = useRef<EventSource | null>(null);

    const stop = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const start = useCallback(() => {
        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        // Build URL with query params
        const url = new URL(`/api/evaluate/${jobId}/stream`, window.location.origin);
        if (executionId) {
            url.searchParams.set('executionId', executionId);
        }

        // Create EventSource
        const es = new EventSource(url.toString());
        eventSourceRef.current = es;

        es.onopen = () => {
            setIsConnected(true);
            setError(null);
        };

        es.onerror = (event) => {
            console.error('SSE error:', event);
            setError(new Error('Connection error'));
            onError?.(new Error('Connection error'));
            stop();
        };

        // Handle custom events
        es.addEventListener('connected', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            console.log('SSE connected:', data);
            setIsConnected(true);
        });

        es.addEventListener('progress', (event: MessageEvent) => {
            const data: EvaluationProgress = JSON.parse(event.data);
            setProgress(data);
        });

        es.addEventListener('complete', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            setIsComplete(true);
            onComplete?.(data);
            stop();
        });

        es.addEventListener('error', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            setError(new Error(data.message || 'Evaluation failed'));
            onError?.(new Error(data.message || 'Evaluation failed'));
            stop();
        });

        es.addEventListener('timeout', (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            setError(new Error(data.message || 'Evaluation timed out'));
            onError?.(new Error(data.message || 'Evaluation timed out'));
            stop();
        });
    }, [jobId, executionId, onComplete, onError, stop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        progress,
        isConnected,
        isComplete,
        error,
        start,
        stop,
    };
}

/**
 * Simpler polling-based hook as fallback
 */
export function useEvaluationPolling(
    options: UseEvaluationStreamOptions
): UseEvaluationStreamReturn {
    const { jobId, executionId, onComplete, onError } = options;

    const [progress, setProgress] = useState<EvaluationProgress | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsConnected(false);
    }, []);

    const start = useCallback(() => {
        stop();
        setIsConnected(true);

        const poll = async () => {
            try {
                const url = new URL(`/api/evaluate/${jobId}/status`, window.location.origin);
                if (executionId) {
                    url.searchParams.set('executionId', executionId);
                }

                const response = await fetch(url.toString());
                if (!response.ok) {
                    throw new Error('Failed to fetch status');
                }

                const result = await response.json();
                const data: EvaluationProgress = result.data;

                setProgress(data);

                if (data.status === 'complete') {
                    setIsComplete(true);
                    onComplete?.(data);
                    stop();
                } else if (data.status === 'failed') {
                    setError(new Error('Evaluation failed'));
                    onError?.(new Error('Evaluation failed'));
                    stop();
                }
            } catch (err) {
                console.error('Polling error:', err);
                setError(err as Error);
                onError?.(err as Error);
                stop();
            }
        };

        // Initial poll
        poll();

        // Set up interval
        intervalRef.current = setInterval(poll, 1000);
    }, [jobId, executionId, onComplete, onError, stop]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        progress,
        isConnected,
        isComplete,
        error,
        start,
        stop,
    };
}
