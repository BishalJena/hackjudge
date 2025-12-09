/**
 * Repos API - List user's GitHub repositories
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserRepos } from '@/lib/github';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('github_token')?.value;

    if (!token) {
        return NextResponse.json(
            { error: 'Not authenticated', repos: [] },
            { status: 401 }
        );
    }

    try {
        const repos = await getUserRepos(token, {
            sort: 'updated',
            per_page: 50,
        });

        return NextResponse.json({ repos });
    } catch (error) {
        console.error('Error fetching repos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repositories', repos: [] },
            { status: 500 }
        );
    }
}
