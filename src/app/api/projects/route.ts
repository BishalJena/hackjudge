/**
 * Projects API - List user's evaluation history
 */
import { NextRequest, NextResponse } from 'next/server';

// Mock project history for demo
const MOCK_PROJECTS = [
    {
        id: 'proj_1',
        repoUrl: 'https://github.com/example/hackjudge-demo',
        branch: 'main',
        status: 'complete',
        readinessScore: 82,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3300000).toISOString(),
    },
    {
        id: 'proj_2',
        repoUrl: 'https://github.com/example/ai-project',
        branch: 'main',
        status: 'complete',
        readinessScore: 76,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86100000).toISOString(),
    },
    {
        id: 'proj_3',
        repoUrl: 'https://github.com/example/web-app',
        branch: 'develop',
        status: 'failed',
        readinessScore: null,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: null,
        error: 'Build failed: npm install error',
    },
];

export async function GET(request: NextRequest) {
    // In production, fetch from database with user filtering
    // For demo, return mock data

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const projects = MOCK_PROJECTS.slice(offset, offset + limit);

    return NextResponse.json({
        success: true,
        data: {
            projects,
            total: MOCK_PROJECTS.length,
            limit,
            offset,
        },
    });
}
