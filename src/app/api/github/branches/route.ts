/**
 * GitHub Branches API - List branches for a repository
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('github_token')?.value;

        const searchParams = request.nextUrl.searchParams;
        const owner = searchParams.get('owner');
        const repo = searchParams.get('repo');

        if (!owner || !repo) {
            return NextResponse.json(
                { success: false, error: 'Owner and repo are required' },
                { status: 400 }
            );
        }

        const headers: HeadersInit = {
            Accept: 'application/vnd.github.v3+json',
        };

        if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
            { headers }
        );

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: 'Failed to fetch branches' },
                { status: response.status }
            );
        }

        const branches = await response.json();

        return NextResponse.json({
            success: true,
            branches: branches.map((b: { name: string }) => b.name),
        });
    } catch (error) {
        console.error('Error fetching branches:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
