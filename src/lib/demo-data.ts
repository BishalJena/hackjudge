/**
 * Demo Project Mock Data - Curated evaluation result for TaskFlow demo
 * This provides a reliable, impressive demo experience
 */
import type { EvaluationResult } from '@/types';

/**
 * Get curated demo result for TaskFlow project
 */
export function getDemoProjectResult(): EvaluationResult {
    return {
        projectId: 'taskflow-demo',
        repoUrl: 'https://github.com/BishalJena/taskflow-demo',
        readinessScore: 68,
        status: 'GOOD',
        summary: 'TaskFlow is a clean, functional task manager built with React and TypeScript. The codebase shows solid fundamentals but has several areas for improvement including accessibility, error handling, and test coverage. With the suggested improvements, this project could score 85+.',
        dimensions: {
            innovation: 55,
            technical: 72,
            ux: 65,
            performance: 78,
            codeQuality: 62,
            presentation: 70,
        },
        strengths: [
            'Clean React component architecture with hooks',
            'TypeScript for type safety',
            'Local storage persistence for offline support',
            'Responsive CSS with CSS variables',
            'Simple, intuitive user interface',
        ],
        weaknesses: [
            'Using \'any\' types instead of proper TypeScript types',
            'No error handling for localStorage operations',
            'Console.log statements left in production code',
            'Missing accessibility attributes (aria-labels)',
            'No test coverage',
        ],
        agentFeedback: [
            {
                agentName: 'Code Quality Agent',
                agentType: 'code_quality',
                score: 62,
                confidence: 95,
                strengths: [
                    'Functional components with hooks',
                    'Consistent code formatting',
                    'Proper state management',
                ],
                weaknesses: [
                    'Using any types in TypeScript',
                    'Console.log in production',
                    'Unused state variables',
                ],
                judgeComment: 'Good foundation but needs cleanup of any types and console logs.',
                evidence: [],
                suggestions: [
                    'Replace any with proper types',
                    'Remove console.log statements',
                    'Add error boundaries',
                ],
            },
            {
                agentName: 'UX & Accessibility Agent',
                agentType: 'ux',
                score: 65,
                confidence: 90,
                strengths: [
                    'Clean, minimal design',
                    'Good color palette',
                    'Responsive layout',
                ],
                weaknesses: [
                    'Missing aria-labels on inputs',
                    'No keyboard shortcuts',
                    'Delete button needs confirmation',
                ],
                judgeComment: 'Visual design is good but accessibility needs work.',
                evidence: [],
                suggestions: [
                    'Add aria-labels to all interactive elements',
                    'Add delete confirmation dialog',
                    'Implement keyboard navigation',
                ],
            },
            {
                agentName: 'Performance Agent',
                agentType: 'performance',
                score: 78,
                confidence: 85,
                strengths: [
                    'Small bundle size with Vite',
                    'Efficient React rendering',
                    'No unnecessary dependencies',
                ],
                weaknesses: [
                    'No code splitting',
                    'localStorage sync on every change',
                ],
                judgeComment: 'Good performance for a simple app. Could benefit from debouncing.',
                evidence: [],
                suggestions: [
                    'Debounce localStorage writes',
                    'Add virtualization for large lists',
                ],
            },
        ],
        improvements: [
            {
                rank: 1,
                category: 'quick-win',
                title: 'Fix TypeScript any types',
                issue: 'Using any instead of proper types reduces type safety',
                rootCause: 'Quick prototyping without proper type definitions',
                impact: 15,
                effort: 1,
                actionItems: [
                    'Change id: any to id: number in Task interface',
                    'Remove unused priority?: any property',
                    'Enable strict TypeScript mode',
                ],
            },
            {
                rank: 2,
                category: 'quick-win',
                title: 'Add accessibility attributes',
                issue: 'Missing aria-labels make app unusable for screen readers',
                rootCause: 'Accessibility not considered during development',
                impact: 12,
                effort: 1,
                actionItems: [
                    'Add aria-label to task input field',
                    'Add aria-label to checkboxes',
                    'Add accessible text to delete buttons',
                ],
            },
            {
                rank: 3,
                category: 'quick-win',
                title: 'Remove console.log statements',
                issue: 'Debug logs left in production code',
                rootCause: 'Development code not cleaned up',
                impact: 8,
                effort: 1,
                actionItems: [
                    'Remove console.log from App.tsx',
                    'Add eslint rule to catch console statements',
                ],
            },
            {
                rank: 4,
                category: 'medium',
                title: 'Add error handling for localStorage',
                issue: 'JSON.parse can throw on corrupted data',
                rootCause: 'No defensive coding for storage operations',
                impact: 10,
                effort: 2,
                actionItems: [
                    'Wrap localStorage.getItem in try-catch',
                    'Add fallback for corrupted data',
                    'Show error message to user on failure',
                ],
            },
            {
                rank: 5,
                category: 'medium',
                title: 'Add unit tests',
                issue: 'No test coverage for components',
                rootCause: 'Testing not prioritized during hackathon',
                impact: 10,
                effort: 4,
                actionItems: [
                    'Set up Vitest for testing',
                    'Add tests for addTask, toggleTask, deleteTask',
                    'Add component tests with Testing Library',
                ],
            },
        ],
        awardEligibility: [
            {
                name: 'Best Developer Experience',
                eligible: true,
                confidence: 70,
                reason: 'Clean, simple codebase with TypeScript',
            },
            {
                name: 'Best UI/UX Design',
                eligible: false,
                confidence: 40,
                reason: 'Good design but accessibility issues',
            },
        ],
        generatedContent: {
            devpostDraft: `# TaskFlow

## Inspiration
We wanted to create the simplest, most elegant task manager that just works.

## What it does
TaskFlow lets you add, complete, and delete tasks with local storage persistence.

## How we built it
- React 18 with hooks
- TypeScript for type safety
- Vite for fast builds
- CSS variables for theming

## Challenges
Balancing simplicity with functionality was the main challenge.

## Accomplishments
- Clean, minimal UI
- Offline-first with localStorage
- Under 100 lines of code

## What's next
- Cloud sync
- Categories and filters
- Mobile app`,
            pitchScript: `TaskFlow - Simple Task Management

[0:00-0:10] Hook
"What if todo apps weren't bloated with features you'll never use?"

[0:10-0:30] Problem
"Most task managers are overcomplicated. You just want to add a task and check it off."

[0:30-1:00] Solution
"TaskFlow does one thing perfectly - manage your tasks. Add, complete, delete. That's it."

[1:00-1:30] Demo
"Let me show you - I add a task, check it off, and it persists even if I refresh."

[1:30-2:00] Close
"TaskFlow - Because productivity shouldn't require a learning curve."`,
            architectureDiagram: `
┌─────────────────────────────────────────┐
│              TaskFlow App               │
├─────────────────────────────────────────┤
│  ┌─────────┐   ┌─────────┐   ┌───────┐ │
│  │  Input  │──▶│  State  │──▶│ List  │ │
│  └─────────┘   └────┬────┘   └───────┘ │
│                     │                   │
│               ┌─────▼─────┐            │
│               │ localStorage│            │
│               └───────────┘            │
└─────────────────────────────────────────┘
`,
        },
        lighthouseScores: {
            performance: 95,
            accessibility: 72,
            bestPractices: 83,
            seo: 80,
            metrics: {
                lcp: 800,
                fid: 10,
                cls: 0.02,
                fcp: 400,
                ttfb: 50,
            },
        },
        completedAt: new Date(),
    };
}
