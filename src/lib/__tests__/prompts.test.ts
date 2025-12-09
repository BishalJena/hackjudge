/**
 * Unit Tests: Prompt Templates
 */

import {
    AgentContext,
    getCodeQualityPrompt,
    getUXDesignPrompt,
    getPerformancePrompt,
    getProductInnovationPrompt,
    getPresentationPrompt,
    getSponsorAlignmentPrompt,
    getAggregationPrompt,
    getDevPostPrompt,
    getPitchScriptPrompt,
} from '@/lib/prompts';

describe('Prompt Templates', () => {
    const baseContext: AgentContext = {
        projectName: 'TestProject',
        repoUrl: 'https://github.com/owner/test-project',
        language: 'TypeScript',
        framework: 'Next.js',
        metadata: { dependencies: ['react', 'next'] },
        readme: '# Test Project\n\nThis is a test project.',
        codeFiles: [
            { path: 'src/index.ts', content: 'export const hello = "world";' },
            { path: 'src/styles.css', content: '.container { padding: 20px; }' },
        ],
        lighthouseData: { performance: 85, accessibility: 90 },
    };

    describe('getCodeQualityPrompt', () => {
        it('should include project name and language', () => {
            const prompt = getCodeQualityPrompt(baseContext);
            expect(prompt).toContain('TestProject');
            expect(prompt).toContain('TypeScript');
            expect(prompt).toContain('Next.js');
        });

        it('should include code snippets', () => {
            const prompt = getCodeQualityPrompt(baseContext);
            expect(prompt).toContain('src/index.ts');
            expect(prompt).toContain('hello');
        });

        it('should include evaluation aspects', () => {
            const prompt = getCodeQualityPrompt(baseContext);
            expect(prompt).toContain('Code Organization');
            expect(prompt).toContain('Type Safety');
            expect(prompt).toContain('Design Patterns');
            expect(prompt).toContain('Error Handling');
        });

        it('should include JSON output format', () => {
            const prompt = getCodeQualityPrompt(baseContext);
            expect(prompt).toContain('"score"');
            expect(prompt).toContain('"strengths"');
            expect(prompt).toContain('"weaknesses"');
        });
    });

    describe('getUXDesignPrompt', () => {
        it('should include project context', () => {
            const prompt = getUXDesignPrompt(baseContext);
            expect(prompt).toContain('TestProject');
            expect(prompt).toContain('Next.js');
        });

        it('should include CSS files', () => {
            const prompt = getUXDesignPrompt(baseContext);
            expect(prompt).toContain('styles.css');
            expect(prompt).toContain('padding');
        });

        it('should include UX evaluation aspects', () => {
            const prompt = getUXDesignPrompt(baseContext);
            expect(prompt).toContain('Visual Hierarchy');
            expect(prompt).toContain('Accessibility');
            expect(prompt).toContain('Responsiveness');
        });
    });

    describe('getPerformancePrompt', () => {
        it('should include Lighthouse data', () => {
            const prompt = getPerformancePrompt(baseContext);
            expect(prompt).toContain('85');
            expect(prompt).toContain('90');
        });

        it('should include performance evaluation aspects', () => {
            const prompt = getPerformancePrompt(baseContext);
            expect(prompt).toContain('Load Performance');
            expect(prompt).toContain('Runtime Performance');
            expect(prompt).toContain('SEO');
        });
    });

    describe('getProductInnovationPrompt', () => {
        it('should include README content', () => {
            const prompt = getProductInnovationPrompt(baseContext);
            expect(prompt).toContain('Test Project');
        });

        it('should include innovation evaluation aspects', () => {
            const prompt = getProductInnovationPrompt(baseContext);
            expect(prompt).toContain('Problem Clarity');
            expect(prompt).toContain('Solution Innovation');
            expect(prompt).toContain('Market Potential');
        });

        it('should include hackathon criteria if provided', () => {
            const contextWithCriteria = {
                ...baseContext,
                hackathonCriteria: { theme: 'AI Innovation' },
            };
            const prompt = getProductInnovationPrompt(contextWithCriteria);
            expect(prompt).toContain('AI Innovation');
        });
    });

    describe('getPresentationPrompt', () => {
        it('should include documentation evaluation aspects', () => {
            const prompt = getPresentationPrompt(baseContext);
            expect(prompt).toContain('README Quality');
            expect(prompt).toContain('Code Documentation');
            expect(prompt).toContain('OSS Best Practices');
        });
    });

    describe('getSponsorAlignmentPrompt', () => {
        it('should include sponsor tools list', () => {
            const sponsorTools = ['Kestra', 'Vercel', 'Together AI'];
            const prompt = getSponsorAlignmentPrompt(baseContext, sponsorTools);
            expect(prompt).toContain('Kestra');
            expect(prompt).toContain('Vercel');
            expect(prompt).toContain('Together AI');
        });

        it('should include sponsor evaluation format', () => {
            const prompt = getSponsorAlignmentPrompt(baseContext, ['Kestra']);
            expect(prompt).toContain('sponsorToolUsage');
            expect(prompt).toContain('integrationLevel');
        });
    });

    describe('getAggregationPrompt', () => {
        it('should include agent results', () => {
            const agentResults = [
                { agentName: 'Code Quality', score: 80 },
                { agentName: 'UX', score: 75 },
            ];
            const prompt = getAggregationPrompt(baseContext, agentResults);
            expect(prompt).toContain('Code Quality');
            expect(prompt).toContain('80');
        });

        it('should include weighting guide', () => {
            const prompt = getAggregationPrompt(baseContext, []);
            expect(prompt).toContain('WEIGHTING GUIDE');
            expect(prompt).toContain('Innovation: 15%');
        });

        it('should include output format', () => {
            const prompt = getAggregationPrompt(baseContext, []);
            expect(prompt).toContain('readinessScore');
            expect(prompt).toContain('prioritizedImprovements');
        });
    });

    describe('getDevPostPrompt', () => {
        it('should include DevPost sections', () => {
            const prompt = getDevPostPrompt(baseContext, { score: 80 });
            expect(prompt).toContain('Inspiration');
            expect(prompt).toContain('What it does');
            expect(prompt).toContain('How we built it');
            expect(prompt).toContain('Challenges');
        });
    });

    describe('getPitchScriptPrompt', () => {
        it('should include pitch sections', () => {
            const prompt = getPitchScriptPrompt(baseContext, { readinessScore: 80 });
            expect(prompt).toContain('HOOK');
            expect(prompt).toContain('PROBLEM');
            expect(prompt).toContain('SOLUTION');
            expect(prompt).toContain('CALL TO ACTION');
        });
    });
});
