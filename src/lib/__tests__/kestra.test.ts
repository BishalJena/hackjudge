/**
 * Unit Tests: Kestra Utilities
 */

import {
    triggerEvaluation,
    getExecutionStatus,
    mapExecutionToProgress,
    getExecutionOutputs,
    downloadArtifact,
    checkKestraHealth,
    KesTraExecution,
} from '@/lib/kestra';

describe('Kestra Utilities', () => {
    describe('triggerEvaluation', () => {
        it('should trigger evaluation workflow successfully', async () => {
            const mockExecution: KesTraExecution = {
                id: 'exec-123',
                namespace: 'hackjudge',
                flowId: 'evaluate-hackathon-project',
                state: {
                    current: 'CREATED',
                    startDate: '2024-01-01T00:00:00Z',
                },
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockExecution),
            });

            const result = await triggerEvaluation({
                repoUrl: 'https://github.com/owner/repo',
                branch: 'main',
                jobId: 'job-123',
            });

            expect(result).toEqual({ executionId: 'exec-123' });
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/executions/'),
                expect.objectContaining({ method: 'POST' })
            );
        });

        it('should return null on API error', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            const result = await triggerEvaluation({
                repoUrl: 'https://github.com/owner/repo',
                jobId: 'job-123',
            });

            expect(result).toBeNull();
        });

        it('should return null on network error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await triggerEvaluation({
                repoUrl: 'https://github.com/owner/repo',
                jobId: 'job-123',
            });

            expect(result).toBeNull();
        });
    });

    describe('getExecutionStatus', () => {
        it('should fetch execution status', async () => {
            const mockExecution: KesTraExecution = {
                id: 'exec-123',
                namespace: 'hackjudge',
                flowId: 'evaluate-hackathon-project',
                state: {
                    current: 'RUNNING',
                    startDate: '2024-01-01T00:00:00Z',
                },
                taskRunList: [
                    {
                        id: 'task-1',
                        taskId: 'clone_repository',
                        state: { current: 'SUCCESS', startDate: '2024-01-01T00:00:00Z' },
                    },
                ],
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockExecution),
            });

            const result = await getExecutionStatus('exec-123');

            expect(result).not.toBeNull();
            expect(result?.id).toBe('exec-123');
            expect(result?.state.current).toBe('RUNNING');
        });

        it('should return null on error', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
            });

            const result = await getExecutionStatus('invalid-id');
            expect(result).toBeNull();
        });
    });

    describe('mapExecutionToProgress', () => {
        it('should map running execution to progress', () => {
            const execution: KesTraExecution = {
                id: 'exec-123',
                namespace: 'hackjudge',
                flowId: 'evaluate-hackathon-project',
                state: {
                    current: 'RUNNING',
                    startDate: '2024-01-01T00:00:00Z',
                },
                taskRunList: [
                    {
                        id: 'task-1',
                        taskId: 'clone_repository',
                        state: { current: 'SUCCESS', startDate: '2024-01-01T00:00:00Z' },
                    },
                    {
                        id: 'task-2',
                        taskId: 'extract_metadata',
                        state: { current: 'RUNNING', startDate: '2024-01-01T00:00:01Z' },
                    },
                ],
            };

            const progress = mapExecutionToProgress(execution);

            expect(progress.status).toBe('running');
            expect(progress.steps).toHaveLength(7);
            expect(progress.steps[0].status).toBe('complete');
            expect(progress.steps[1].status).toBe('running');
            expect(progress.logs).toContain('✓ Clone Repository completed');
        });

        it('should map completed execution to progress', () => {
            const execution: KesTraExecution = {
                id: 'exec-123',
                namespace: 'hackjudge',
                flowId: 'evaluate-hackathon-project',
                state: {
                    current: 'SUCCESS',
                    startDate: '2024-01-01T00:00:00Z',
                    endDate: '2024-01-01T00:05:00Z',
                },
            };

            const progress = mapExecutionToProgress(execution);
            expect(progress.status).toBe('complete');
        });

        it('should map failed execution to progress', () => {
            const execution: KesTraExecution = {
                id: 'exec-123',
                namespace: 'hackjudge',
                flowId: 'evaluate-hackathon-project',
                state: {
                    current: 'FAILED',
                    startDate: '2024-01-01T00:00:00Z',
                },
                taskRunList: [
                    {
                        id: 'task-1',
                        taskId: 'clone_repository',
                        state: { current: 'FAILED', startDate: '2024-01-01T00:00:00Z' },
                    },
                ],
            };

            const progress = mapExecutionToProgress(execution);
            expect(progress.status).toBe('failed');
            expect(progress.steps[0].status).toBe('failed');
        });
    });

    describe('getExecutionOutputs', () => {
        it('should fetch execution outputs', async () => {
            const mockOutputs = {
                finalReport: { score: 85 },
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockOutputs),
            });

            const result = await getExecutionOutputs('exec-123');
            expect(result).toEqual(mockOutputs);
        });

        it('should return null on error', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            });

            const result = await getExecutionOutputs('exec-123');
            expect(result).toBeNull();
        });
    });

    describe('downloadArtifact', () => {
        it('should download artifact as blob', async () => {
            const mockBlob = new Blob(['test data'], { type: 'application/json' });

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                blob: () => Promise.resolve(mockBlob),
            });

            const result = await downloadArtifact('exec-123', '/path/to/artifact');
            expect(result).toBeInstanceOf(Blob);
        });

        it('should return null on error', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            });

            const result = await downloadArtifact('exec-123', '/path/to/artifact');
            expect(result).toBeNull();
        });
    });

    describe('checkKestraHealth', () => {
        it('should return true when Kestra is healthy', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
            });

            const result = await checkKestraHealth();
            expect(result).toBe(true);
        });

        it('should return false when Kestra is unhealthy', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
            });

            const result = await checkKestraHealth();
            expect(result).toBe(false);
        });

        it('should return false on network error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

            const result = await checkKestraHealth();
            expect(result).toBe(false);
        });
    });
});
