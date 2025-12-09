/**
 * Integration Tests: React Hooks
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useEvaluationStream, useEvaluationPolling } from '@/hooks/useEvaluationStream';

// Mock EventSource
class MockEventSource {
    url: string;
    onopen: (() => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    listeners: Map<string, (event: MessageEvent) => void> = new Map();

    constructor(url: string) {
        this.url = url;
        // Simulate connection
        setTimeout(() => {
            this.onopen?.();
        }, 0);
    }

    addEventListener(event: string, callback: (event: MessageEvent) => void) {
        this.listeners.set(event, callback);
    }

    close() {
        this.listeners.clear();
    }

    // Helper to simulate events
    emit(event: string, data: unknown) {
        const callback = this.listeners.get(event);
        if (callback) {
            callback({ data: JSON.stringify(data) } as MessageEvent);
        }
    }
}

// @ts-expect-error - Mock EventSource
global.EventSource = MockEventSource;

describe('useEvaluationStream Hook', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should initialize with null progress', () => {
        const { result } = renderHook(() =>
            useEvaluationStream({ jobId: 'test-job' })
        );

        expect(result.current.progress).toBeNull();
        expect(result.current.isConnected).toBe(false);
        expect(result.current.isComplete).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should have start and stop functions', () => {
        const { result } = renderHook(() =>
            useEvaluationStream({ jobId: 'test-job' })
        );

        expect(typeof result.current.start).toBe('function');
        expect(typeof result.current.stop).toBe('function');
    });
});

describe('useEvaluationPolling Hook', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        (global.fetch as jest.Mock).mockClear();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should initialize with null progress', () => {
        const { result } = renderHook(() =>
            useEvaluationPolling({ jobId: 'test-job' })
        );

        expect(result.current.progress).toBeNull();
        expect(result.current.isConnected).toBe(false);
    });

    it('should poll for status when started', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                data: {
                    jobId: 'test-job',
                    status: 'running',
                    currentStep: 2,
                    totalSteps: 7,
                    steps: [],
                    progress: 28,
                    logs: [],
                },
            }),
        });

        const { result } = renderHook(() =>
            useEvaluationPolling({ jobId: 'test-job' })
        );

        act(() => {
            result.current.start();
        });

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        expect(global.fetch).toHaveBeenCalled();
    });

    it('should call onComplete when evaluation finishes', async () => {
        const onComplete = jest.fn();

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                data: {
                    jobId: 'test-job',
                    status: 'complete',
                    currentStep: 7,
                    totalSteps: 7,
                    steps: [],
                    progress: 100,
                    logs: [],
                },
            }),
        });

        const { result } = renderHook(() =>
            useEvaluationPolling({ jobId: 'test-job', onComplete })
        );

        act(() => {
            result.current.start();
        });

        await waitFor(() => {
            expect(result.current.isComplete).toBe(true);
        });

        expect(onComplete).toHaveBeenCalled();
    });

    it('should call onError on failure', async () => {
        const onError = jest.fn();

        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() =>
            useEvaluationPolling({ jobId: 'test-job', onError })
        );

        act(() => {
            result.current.start();
        });

        await waitFor(() => {
            expect(result.current.error).not.toBeNull();
        });

        expect(onError).toHaveBeenCalled();
    });

    it('should stop polling when stop is called', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                data: { status: 'running', steps: [] },
            }),
        });

        const { result } = renderHook(() =>
            useEvaluationPolling({ jobId: 'test-job' })
        );

        act(() => {
            result.current.start();
        });

        await waitFor(() => {
            expect(result.current.isConnected).toBe(true);
        });

        act(() => {
            result.current.stop();
        });

        expect(result.current.isConnected).toBe(false);
    });
});
