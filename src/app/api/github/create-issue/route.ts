/**
 * API Route: Create GitHub Issue (via Kestra)
 * Triggers the Kestra GitHub plugin flow for issue creation
 */
import { NextRequest, NextResponse } from 'next/server';

const KESTRA_API_URL = process.env.KESTRA_API_URL || 'http://localhost:8080/api/v1';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { owner, repo, title, body: issueBody, labels = 'hackjudge,improvement' } = body;

        if (!owner || !repo || !title) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: owner, repo, title' },
                { status: 400 }
            );
        }

        // Trigger Kestra flow for issue creation
        const kestraResponse = await fetch(
            `${KESTRA_API_URL}/executions/webhook/hackjudge/create-github-issue/create-issue`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    owner,
                    repo,
                    title,
                    body: issueBody || '',
                    labels: Array.isArray(labels) ? labels.join(',') : labels,
                }),
            }
        );

        if (!kestraResponse.ok) {
            const errorText = await kestraResponse.text();
            console.error('Kestra trigger failed:', kestraResponse.status, errorText);
            return NextResponse.json(
                { success: false, error: 'Failed to trigger Kestra workflow' },
                { status: 500 }
            );
        }

        const execution = await kestraResponse.json();

        return NextResponse.json({
            success: true,
            message: 'Issue creation triggered via Kestra',
            executionId: execution.id,
            kestraUrl: `${KESTRA_API_URL.replace('/api/v1', '')}/ui/executions/hackjudge/create-github-issue/${execution.id}`,
        });
    } catch (error) {
        console.error('Create issue error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
