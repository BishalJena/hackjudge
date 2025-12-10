/**
 * Auth Me API - Get current authenticated user
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/github';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('github_token')?.value;

    if (!token) {
        return NextResponse.json(
            { user: null, authenticated: false },
            { status: 200 }
        );
    }

    try {
        const user = await getAuthenticatedUser(token);

        if (!user) {
            // Token is invalid, clear it
            const response = NextResponse.json(
                { user: null, authenticated: false },
                { status: 200 }
            );
            response.cookies.delete('github_token');
            return response;
        }

        return NextResponse.json({
            user: {
                login: user.login,
                id: user.id,
                avatarUrl: user.avatarUrl,
                name: user.name,
                email: user.email,
            },
            authenticated: true,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { user: null, authenticated: false, error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}
