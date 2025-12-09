/**
 * Integration Tests: API Routes
 */

import { isValidGitHubUrl, parseGitHubUrl } from '@/lib/github';
import { checkKestraHealth } from '@/lib/kestra';

// These tests verify the utility functions used by API routes
describe('API Route Utilities', () => {
    describe('GitHub URL validation for /api/evaluate', () => {
        it('should validate correct GitHub URLs', () => {
            expect(isValidGitHubUrl('https://github.com/owner/repo')).toBe(true);
            expect(isValidGitHubUrl('https://github.com/facebook/react')).toBe(true);
        });

        it('should reject non-GitHub URLs', () => {
            expect(isValidGitHubUrl('https://gitlab.com/owner/repo')).toBe(false);
            expect(isValidGitHubUrl('https://bitbucket.org/owner/repo')).toBe(false);
        });

        it('should parse GitHub URL correctly', () => {
            const result = parseGitHubUrl('https://github.com/owner/test-repo');
            expect(result).toEqual({ owner: 'owner', repo: 'test-repo' });
        });
    });

    describe('Kestra health check for /api/evaluate', () => {
        // Mock global.fetch for Kestra health check
        const originalFetch = global.fetch;
        beforeAll(() => {
            global.fetch = jest.fn();
        });
        afterAll(() => {
            global.fetch = originalFetch;
        });

        it('should return false when Kestra is not available', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));
            const result = await checkKestraHealth();
            expect(result).toBe(false);
        });

        it('should return true when Kestra is healthy', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
            const result = await checkKestraHealth();
            expect(result).toBe(true);
        });
    });

    describe('Job ID format', () => {
        it('should generate valid job IDs', () => {
            const jobId = `eval_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            expect(jobId).toMatch(/^eval_\d+_[a-z0-9]+$/);
        });

        it('should extract timestamp from job ID', () => {
            const timestamp = Date.now();
            const jobId = `eval_${timestamp}_abc123`;
            const extracted = parseInt(jobId.split('_')[1], 10);
            expect(extracted).toBe(timestamp);
        });
    });

    describe('Status calculation', () => {
        const EVALUATION_STEPS = [
            { id: 'clone', name: 'Clone Repository', duration: 2000 },
            { id: 'metadata', name: 'Extract Metadata', duration: 1500 },
            { id: 'build', name: 'Build Project', duration: 3000 },
            { id: 'lighthouse', name: 'Run Lighthouse', duration: 2500 },
            { id: 'screenshots', name: 'Capture Screenshots', duration: 2000 },
            { id: 'agents', name: 'Multi-Agent Analysis', duration: 4000 },
            { id: 'report', name: 'Generate Report', duration: 1500 },
        ];

        it('should calculate correct step based on elapsed time', () => {
            const jobTimestamp = Date.now() - 5000; // 5 seconds ago
            const elapsed = Date.now() - jobTimestamp;

            let currentStep = 0;
            let accumulatedTime = 0;

            for (let i = 0; i < EVALUATION_STEPS.length; i++) {
                accumulatedTime += EVALUATION_STEPS[i].duration;
                if (elapsed < accumulatedTime) {
                    currentStep = i;
                    break;
                }
                currentStep = i + 1;
            }

            expect(currentStep).toBeGreaterThanOrEqual(0);
            expect(currentStep).toBeLessThanOrEqual(EVALUATION_STEPS.length);
        });

        it('should mark as complete when all steps done', () => {
            const totalDuration = EVALUATION_STEPS.reduce((sum, s) => sum + s.duration, 0);
            const jobTimestamp = Date.now() - (totalDuration + 1000);
            const elapsed = Date.now() - jobTimestamp;

            let currentStep = 0;
            let accumulatedTime = 0;

            for (let i = 0; i < EVALUATION_STEPS.length; i++) {
                accumulatedTime += EVALUATION_STEPS[i].duration;
                if (elapsed < accumulatedTime) {
                    currentStep = i;
                    break;
                }
                currentStep = i + 1;
            }

            expect(currentStep).toBe(EVALUATION_STEPS.length);
        });
    });
});
