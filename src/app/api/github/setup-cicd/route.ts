/**
 * API Route: Setup CI/CD (via Kestra)
 * Triggers the Kestra GitHub plugin flow for CI/CD setup
 */
import { NextRequest, NextResponse } from 'next/server';

const KESTRA_API_URL = process.env.KESTRA_API_URL || 'http://localhost:8080/api/v1';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { owner, repo, branch = 'main' } = body;

        if (!owner || !repo) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: owner, repo' },
                { status: 400 }
            );
        }

        // Trigger Kestra flow for CI/CD setup
        const kestraResponse = await fetch(
            `${KESTRA_API_URL}/executions/webhook/hackjudge/setup-cicd/setup-cicd`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    owner,
                    repo,
                    branch,
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
            message: 'CI/CD setup triggered via Kestra',
            executionId: execution.id,
            kestraUrl: `${KESTRA_API_URL.replace('/api/v1', '')}/ui/executions/hackjudge/setup-cicd/${execution.id}`,
        });
    } catch (error) {
        console.error('Setup CI/CD error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
