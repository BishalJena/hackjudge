/**
 * GitHub OAuth - Redirect to GitHub authorization
 */
import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.GITHUB_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json(
            { error: 'GitHub OAuth not configured' },
            { status: 500 }
        );
    }

    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;
    const scope = 'read:user user:email repo';

    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);

    return NextResponse.redirect(authUrl.toString());
}
