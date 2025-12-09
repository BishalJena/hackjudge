/**
 * Mock Data - Development and demo data
 */
import type { EvaluationResult, AgentOutput, Improvement, AwardEligibility } from '@/types';

/**
 * Generate mock evaluation result for development/demo
 */
export function getMockEvaluationResult(projectId: string): EvaluationResult {
    return {
        projectId,
        readinessScore: 82,
        status: 'STRONG',
        summary:
            'Well-executed AI project demonstrating solid architecture and clean code practices. The multi-agent orchestration using Kestra shows strong technical understanding. Minor performance improvements would push this into excellent territory. UX is clean and responsive. Consider adding more comprehensive error handling and API documentation.',
        dimensions: {
            innovation: 78,
            technical: 85,
            ux: 81,
            performance: 62,
            codeQuality: 87,
            presentation: 76,
        },
        strengths: [
            'Multi-agent orchestration with Kestra workflow engine',
            'Clean, modular codebase with proper separation of concerns',
            'Responsive UI design with terminal aesthetic',
            'Comprehensive TypeScript types throughout',
            'Well-documented API endpoints',
        ],
        weaknesses: [
            'Lighthouse performance score: 62 → target 80 (+18 pts needed)',
            'API documentation is minimal for some endpoints',
            'Missing error handling in 5 critical places',
            'No automated tests for agent logic',
            'Mobile experience could be improved',
        ],
        agentFeedback: getMockAgentFeedback(),
        improvements: getMockImprovements(),
        awardEligibility: getMockAwardEligibility(),
        generatedContent: {
            devpostDraft: getMockDevpostDraft(projectId),
            pitchScript: getMockPitchScript(projectId),
            architectureDiagram: getMockArchitectureDiagram(),
        },
        screenshots: [
            '/screenshots/landing.png',
            '/screenshots/dashboard.png',
            '/screenshots/report.png',
        ],
        lighthouseScores: {
            performance: 62,
            accessibility: 94,
            bestPractices: 87,
            seo: 91,
            metrics: {
                lcp: 3200,
                fid: 45,
                cls: 0.12,
                fcp: 1800,
                ttfb: 380,
            },
        },
        completedAt: new Date(),
    };
}

function getMockAgentFeedback(): AgentOutput[] {
    return [
        {
            agentName: 'Code Quality & Architecture Agent',
            agentType: 'code_quality',
            score: 87,
            confidence: 92,
            strengths: [
                'Consistent code style across the codebase',
                'Good use of TypeScript for type safety',
                'Modular component architecture',
                'Proper use of async/await patterns',
            ],
            weaknesses: [
                'Some components exceed 200 lines - consider splitting',
                'Missing error boundaries in React components',
                'A few any types that could be properly typed',
            ],
            judgeComment:
                'Your code is well-structured and demonstrates solid understanding of design principles. A few minor refactorings would push this to 95+.',
            evidence: [],
            suggestions: [
                'Add error boundaries to catch rendering errors',
                'Split large components into smaller, focused units',
                'Replace remaining any types with proper interfaces',
            ],
        },
        {
            agentName: 'Product & Innovation Agent',
            agentType: 'product',
            score: 78,
            confidence: 85,
            strengths: [
                'Unique approach to hackathon judging',
                'Multi-agent system adds credibility',
                'Clear value proposition',
            ],
            weaknesses: [
                'Similar tools exist in the market',
                'Need stronger differentiation story',
                'Consider adding unique features for hackathon context',
            ],
            judgeComment:
                'The product vision is solid, but needs a stronger "wow factor" to stand out. Consider adding live coding suggestions or real-time PR generation.',
            evidence: [],
            suggestions: [
                'Add real-time PR generation feature',
                'Include video walkthrough generation',
                'Consider integration with DevPost API',
            ],
        },
        {
            agentName: 'UX & Design Agent',
            agentType: 'ux',
            score: 81,
            confidence: 88,
            strengths: [
                'Cohesive terminal aesthetic throughout',
                'Good use of color for status indicators',
                'Responsive layout works on mobile',
            ],
            weaknesses: [
                'Some text may be hard to read on certain displays',
                'Loading states could be more informative',
                'Consider adding keyboard shortcuts for power users',
            ],
            judgeComment:
                'The terminal aesthetic is well-executed and creates a unique identity. Minor accessibility improvements would make this excellent.',
            evidence: [],
            suggestions: [
                'Increase contrast for dim text colors',
                'Add skip-to-content link for accessibility',
                'Implement keyboard shortcut system',
            ],
        },
        {
            agentName: 'Performance Agent',
            agentType: 'performance',
            score: 62,
            confidence: 95,
            strengths: [
                'Good TTI (Time to Interactive)',
                'Reasonable bundle size for features included',
                'Efficient React rendering patterns',
            ],
            weaknesses: [
                'LCP (Largest Contentful Paint) exceeds target',
                'Initial bundle could be further optimized',
                'Some heavy libraries loaded synchronously',
            ],
            judgeComment:
                'Performance is the weakest area. Focus on optimizing LCP by lazy-loading non-critical content and implementing code splitting.',
            evidence: [],
            suggestions: [
                'Implement code splitting for report page',
                'Lazy load modal content',
                'Optimize images with next/image',
                'Consider using dynamic imports for heavy components',
            ],
        },
        {
            agentName: 'Presentation Agent',
            agentType: 'presentation',
            score: 76,
            confidence: 82,
            strengths: [
                'README provides good overview',
                'Code comments explain complex logic',
                'Demo flow is clear and logical',
            ],
            weaknesses: [
                'Missing demo video',
                'Could use more inline documentation',
                'Architecture diagram would help understanding',
            ],
            judgeComment:
                'Good foundation for presentation, but a compelling demo video would significantly boost your chances. Consider recording a 2-minute walkthrough.',
            evidence: [],
            suggestions: [
                'Create a 2-minute demo video',
                'Add architecture diagram to README',
                'Include GIFs showing key features',
            ],
        },
    ];
}

function getMockImprovements(): Improvement[] {
    return [
        {
            rank: 1,
            category: 'quick-win',
            title: 'Improve Lighthouse Performance Score',
            issue: 'LCP = 3.2s (target < 2.5s)',
            rootCause: 'Large JavaScript bundle blocking initial render',
            impact: 18,
            effort: 2,
            actionItems: [
                'Implement code splitting with dynamic imports',
                'Lazy load the report page components',
                'Add loading skeleton for above-fold content',
                'Optimize font loading with display: swap',
            ],
        },
        {
            rank: 2,
            category: 'medium',
            title: 'Add API Documentation',
            issue: 'Missing endpoint descriptions and examples',
            rootCause: 'Documentation was not prioritized during development',
            impact: 8,
            effort: 4,
            actionItems: [
                'Add OpenAPI/Swagger documentation',
                'Document request/response schemas',
                'Include example curl commands',
                'Generate TypeScript types from OpenAPI',
            ],
        },
        {
            rank: 3,
            category: 'medium',
            title: 'Error Handling in API Layer',
            issue: 'Unhandled promise rejections in 5 places',
            rootCause: 'Missing try-catch blocks and error boundaries',
            impact: 6,
            effort: 3,
            actionItems: [
                'Add try-catch in all API route handlers',
                'Implement React error boundaries',
                'Create consistent error response format',
                'Add error logging and monitoring',
            ],
        },
        {
            rank: 4,
            category: 'quick-win',
            title: 'Add Demo Video',
            issue: 'No video demonstration available',
            rootCause: 'Not yet created',
            impact: 10,
            effort: 1,
            actionItems: [
                'Record 2-minute walkthrough using Loom or similar',
                'Cover: landing, evaluation flow, report highlights',
                'Add video link to README and DevPost submission',
            ],
        },
        {
            rank: 5,
            category: 'complex',
            title: 'Implement Automated Tests',
            issue: 'No test coverage for agent logic',
            rootCause: 'Testing was deferred for hackathon deadline',
            impact: 5,
            effort: 8,
            actionItems: [
                'Add unit tests for core utility functions',
                'Add integration tests for API routes',
                'Add component tests for UI components',
                'Set up CI/CD pipeline with test runs',
            ],
        },
    ];
}

function getMockAwardEligibility(): AwardEligibility[] {
    return [
        {
            name: 'Infinity Build Award (uses 3+ sponsor tools)',
            eligible: true,
            confidence: 95,
            reason: 'Kestra, Together AI, Vercel detected',
        },
        {
            name: 'Iron Intelligence (Oumi integration)',
            eligible: false,
            confidence: 60,
            reason: 'Oumi not detected in codebase',
        },
        {
            name: 'Captain Code (CodeRabbit review)',
            eligible: false,
            confidence: 30,
            reason: 'No CodeRabbit configuration found',
        },
        {
            name: 'Best AI Agent Implementation',
            eligible: true,
            confidence: 85,
            reason: 'Strong multi-agent architecture',
        },
        {
            name: 'Best Developer Experience',
            eligible: true,
            confidence: 75,
            reason: 'Good docs, clean codebase',
        },
    ];
}

function getMockDevpostDraft(projectId: string): string {
    return `# ${projectId}

## Inspiration
Hackathon judging is traditionally a manual, time-consuming process. We wanted to create an AI-powered solution that could provide instant, comprehensive feedback to participants.

## What it does
HackJudge AI is an autonomous hackathon review agent that analyzes submitted projects across multiple dimensions:
- Code Quality & Architecture
- Product Innovation
- UX & Design
- Performance
- Presentation

## How we built it
- **Frontend**: Next.js 14+ with App Router, React 19
- **Styling**: Terminal-aesthetic CSS with Departure Mono font
- **Orchestration**: Kestra workflow engine for multi-step evaluation
- **AI**: Together AI / OpenAI APIs for multi-agent analysis
- **Deployment**: Vercel for frontend, Docker for sandboxed execution

## Challenges we ran into
- Coordinating multiple AI agents to provide coherent feedback
- Sandboxing project builds securely in Docker
- Achieving real-time progress updates through SSE

## Accomplishments that we're proud of
- Terminal-first aesthetic that feels authentic
- Multi-agent system with specialized judges
- Comprehensive report generation
- Auto-generated submission content

## What we learned
- Orchestration engines like Kestra are powerful for complex pipelines
- LLMs can effectively simulate expert judgment when properly prompted
- Terminal aesthetics require careful attention to typography

## What's next for HackJudge AI
- Live PR generation with suggested fixes
- Integration with DevPost API for direct submissions
- Video demo generation
- Community-powered rubric templates

## Built With
- nextjs
- react
- typescript
- kestra
- together-ai
- vercel
- docker
`;
}

function getMockPitchScript(projectId: string): string {
    return `# ${projectId} - Pitch Script (2 minutes)

[0:00 - 0:15] HOOK
"What if you could get instant, expert-level feedback on your hackathon project? Not just a score, but actionable insights from specialized AI judges?"

[0:15 - 0:30] PROBLEM
"Hackathon judging takes time. Judges are overwhelmed. Participants wait hours for feedback that's often brief and generic."

[0:30 - 1:00] SOLUTION
"Introducing HackJudge AI - an autonomous hackathon review agent. Paste your GitHub repo, and within 5 minutes you'll receive:
- Detailed scores across 6 dimensions
- Feedback from 5 specialized AI judges
- A prioritized improvement roadmap
- Auto-generated submission content"

[1:00 - 1:30] DEMO
"Let me show you. I'll paste this repo URL... [paste]
The system clones, builds, captures screenshots, runs Lighthouse, and invokes AI agents.
[show progress]
Here's the report: 82/100 - Strong. Let's look at the dimension breakdown..."

[1:30 - 1:50] TECHNOLOGY
"Under the hood, we use:
- Kestra for workflow orchestration
- Together AI for multi-agent reasoning
- Docker for sandboxed execution
- Next.js for a terminal-styled frontend"

[1:50 - 2:00] CLOSE
"HackJudge AI: Ship with confidence. Get instant, intelligent feedback for every hackathon project."

[END]
`;
}

function getMockArchitectureDiagram(): string {
    return `
┌─────────────────────────────────────────────────────────────┐
│                      HACKJUDGE AI                           │
│                    Architecture Diagram                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│   Browser   │────▶│   Vercel    │────▶│   Kestra Pipeline   │
│   (User)    │◀────│   Next.js   │◀────│   (Orchestration)   │
└─────────────┘     └─────────────┘     └─────────────────────┘
                           │                      │
                           │                      ▼
                    ┌──────▼──────┐     ┌─────────────────────┐
                    │  PostgreSQL │     │   Docker Sandbox    │
                    │   (State)   │     │  - Clone & Build    │
                    └─────────────┘     │  - Lighthouse       │
                                        │  - Screenshots      │
                                        └─────────────────────┘
                                                  │
                                                  ▼
                                        ┌─────────────────────┐
                                        │   Together AI API   │
                                        │   ┌───────────────┐ │
                                        │   │ Code Agent    │ │
                                        │   │ Product Agent │ │
                                        │   │ UX Agent      │ │
                                        │   │ Perf Agent    │ │
                                        │   │ Present Agent │ │
                                        │   └───────────────┘ │
                                        └─────────────────────┘
`;
}
