/**
 * GitHub OAuth Callback - Exchange code for token
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(
            new URL(`/?error=${encodeURIComponent(error)}`, request.url)
        );
    }

    if (!code) {
        return NextResponse.redirect(
            new URL('/?error=no_code', request.url)
        );
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.redirect(
            new URL('/?error=oauth_not_configured', request.url)
        );
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return NextResponse.redirect(
                new URL(`/?error=${encodeURIComponent(tokenData.error)}`, request.url)
            );
        }

        // In a real app, you would:
        // 1. Store the token in an httpOnly cookie or database
        // 2. Fetch user info and create/update user record
        // 3. Create a session

        // For now, redirect to dashboard
        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        // Set token in httpOnly cookie (for demo purposes)
        response.cookies.set('github_token', tokenData.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(
            new URL('/?error=oauth_failed', request.url)
        );
    }
}
