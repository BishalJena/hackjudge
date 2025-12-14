/**
 * Batch Create Issues - Creates multiple GitHub issues for improvements
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface Improvement {
    title: string;
    description?: string;
    issue?: string;
    rootCause?: string;
    actionItems?: string[];
    impact?: number;
    effort?: number;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { owner, repo, improvements } = body;

        if (!owner || !repo || !improvements || !Array.isArray(improvements)) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: owner, repo, improvements[]' },
                { status: 400 }
            );
        }

        // Get GitHub token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('github_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated. Please sign in with GitHub.' },
                { status: 401 }
            );
        }

        const createdIssues: { title: string; url: string; number: number }[] = [];
        const errors: { title: string; error: string }[] = [];

        // Create issues sequentially (to avoid rate limiting)
        for (const improvement of improvements as Improvement[]) {
            try {
                // Build issue body
                const issueBody = `## 🎯 Improvement Suggestion

${improvement.description || improvement.issue || improvement.title}

${improvement.rootCause ? `### Root Cause\n${improvement.rootCause}\n` : ''}

${improvement.actionItems && improvement.actionItems.length > 0 ? `### Action Items\n${improvement.actionItems.map(item => `- [ ] ${item}`).join('\n')}\n` : ''}

${improvement.impact ? `**Impact:** +${improvement.impact} points` : ''}${improvement.effort ? ` | **Effort:** ${improvement.effort}h` : ''}

---
_Created by [HackJudge AI](https://hackjudge.ai) 🤖_`;

                const response = await fetch(
                    `https://api.github.com/repos/${owner}/${repo}/issues`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/vnd.github+json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: `[HackJudge] ${improvement.title}`,
                            body: issueBody,
                            labels: ['hackjudge', 'improvement', 'enhancement'],
                        }),
                    }
                );

                if (response.ok) {
                    const issue = await response.json();
                    createdIssues.push({
                        title: improvement.title,
                        url: issue.html_url,
                        number: issue.number,
                    });
                } else {
                    const error = await response.json();
                    errors.push({
                        title: improvement.title,
                        error: error.message || 'Failed to create issue',
                    });
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 300));
            } catch (err) {
                errors.push({
                    title: improvement.title,
                    error: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        }

        return NextResponse.json({
            success: true,
            created: createdIssues.length,
            total: improvements.length,
            issues: createdIssues,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('Batch create issues error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
