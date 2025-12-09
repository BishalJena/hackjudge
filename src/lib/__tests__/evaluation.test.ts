/**
 * Unit Tests: Evaluation Service
 */

import { runEvaluation, generateContent, EvaluationInput } from '@/lib/evaluation';

// Mock the LLM module
jest.mock('@/lib/llm', () => ({
    getDefaultLLMClient: jest.fn(() => null), // Return null to use mock mode
    runAgentsParallel: jest.fn(),
    aggregateScores: jest.fn(() => ({
        overall: 80,
        dimensions: { code_quality: 85, ux: 75 },
        confidence: 85,
    })),
}));

describe('Evaluation Service', () => {
    const mockInput: EvaluationInput = {
        repoUrl: 'https://github.com/owner/test-repo',
        branch: 'main',
        projectName: 'TestProject',
        metadata: {
            language: 'TypeScript',
            framework: 'Next.js',
        },
        readme: '# Test Project',
        codeFiles: [{ path: 'src/index.ts', content: 'console.log("test")' }],
    };

    describe('runEvaluation', () => {
        it('should return mock result when no LLM client available', async () => {
            const result = await runEvaluation(mockInput);

            expect(result).toBeDefined();
            expect(result.projectId).toBe('testproject');
            expect(result.readinessScore).toBeGreaterThan(0);
            expect(result.status).toBeDefined();
        });

        it('should call progress callback during evaluation', async () => {
            const progressCallback = jest.fn();
            await runEvaluation(mockInput, progressCallback);

            expect(progressCallback).toHaveBeenCalled();
        });

        it('should include all required fields in result', async () => {
            const result = await runEvaluation(mockInput);

            expect(result).toHaveProperty('projectId');
            expect(result).toHaveProperty('readinessScore');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('summary');
            expect(result).toHaveProperty('dimensions');
            expect(result).toHaveProperty('strengths');
            expect(result).toHaveProperty('weaknesses');
            expect(result).toHaveProperty('improvements');
            expect(result).toHaveProperty('awardEligibility');
            expect(result).toHaveProperty('generatedContent');
            expect(result).toHaveProperty('completedAt');
        });

        it('should include dimension scores', async () => {
            const result = await runEvaluation(mockInput);

            expect(result.dimensions).toHaveProperty('innovation');
            expect(result.dimensions).toHaveProperty('technical');
            expect(result.dimensions).toHaveProperty('ux');
            expect(result.dimensions).toHaveProperty('performance');
            expect(result.dimensions).toHaveProperty('codeQuality');
            expect(result.dimensions).toHaveProperty('presentation');
        });

        it('should return valid status values', async () => {
            const result = await runEvaluation(mockInput);

            expect(['STRONG', 'GOOD', 'NEEDS_WORK', 'WEAK']).toContain(result.status);
        });
    });

    describe('generateContent', () => {
        it('should generate devpost draft', async () => {
            const mockEvaluationResult = {
                projectId: 'test',
                readinessScore: 80,
                status: 'STRONG' as const,
                summary: 'Good project',
                dimensions: {
                    innovation: 80,
                    technical: 85,
                    ux: 75,
                    performance: 70,
                    codeQuality: 85,
                    presentation: 80,
                },
                strengths: ['Good code'],
                weaknesses: ['Missing tests'],
                agentFeedback: [],
                improvements: [],
                awardEligibility: [],
                generatedContent: { devpostDraft: '', pitchScript: '', architectureDiagram: '' },
                completedAt: new Date(),
            };

            const content = await generateContent('devpost', mockInput, mockEvaluationResult);

            expect(content).toBeDefined();
            expect(content).toContain('Inspiration');
            expect(content).toContain('What it does');
        });

        it('should generate pitch script', async () => {
            const mockEvaluationResult = {
                projectId: 'test',
                readinessScore: 80,
                status: 'STRONG' as const,
                summary: 'Good project',
                dimensions: {
                    innovation: 80,
                    technical: 85,
                    ux: 75,
                    performance: 70,
                    codeQuality: 85,
                    presentation: 80,
                },
                strengths: ['Good code'],
                weaknesses: ['Missing tests'],
                agentFeedback: [],
                improvements: [],
                awardEligibility: [],
                generatedContent: { devpostDraft: '', pitchScript: '', architectureDiagram: '' },
                completedAt: new Date(),
            };

            const content = await generateContent('pitch', mockInput, mockEvaluationResult);

            expect(content).toBeDefined();
            expect(content).toContain('HOOK');
            expect(content).toContain('PROBLEM');
        });
    });
});
