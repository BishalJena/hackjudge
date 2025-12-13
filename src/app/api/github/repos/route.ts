/**
 * GitHub Repos API - List user's repositories
 * Used for repository dropdown after OAuth
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string | null;
    default_branch: string;
    language: string | null;
    updated_at: string;
    stargazers_count: number;
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('github_token')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Get query params for filtering
        const searchParams = request.nextUrl.searchParams;
        const perPage = parseInt(searchParams.get('per_page') || '50');
        const sort = searchParams.get('sort') || 'updated';
        const type = searchParams.get('type') || 'all'; // all, owner, member

        // Fetch repos from GitHub
        const response = await fetch(
            `https://api.github.com/user/repos?per_page=${perPage}&sort=${sort}&type=${type}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('GitHub API error:', error);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch repositories' },
                { status: response.status }
            );
        }

        const repos: GitHubRepo[] = await response.json();

        // Transform to simplified format
        const simplifiedRepos = repos.map((repo) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            isPrivate: repo.private,
            url: repo.html_url,
            description: repo.description,
            defaultBranch: repo.default_branch,
            language: repo.language,
            updatedAt: repo.updated_at,
            stars: repo.stargazers_count,
        }));

        return NextResponse.json({
            success: true,
            repos: simplifiedRepos,
            count: simplifiedRepos.length,
        });
    } catch (error) {
        console.error('Error fetching repos:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
