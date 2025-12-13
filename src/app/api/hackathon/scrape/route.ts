/**
 * Hackathon Scrape API - Fetch hackathon info from DevPost URLs
 */
import { NextRequest, NextResponse } from 'next/server';
import { scrapeHackathonUrl, formatHackathonContext } from '@/lib/hackathon-scraper';

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json(
                { success: false, error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        const info = await scrapeHackathonUrl(url);

        if (!info) {
            return NextResponse.json(
                { success: false, error: 'Could not extract hackathon information' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...info,
                formattedContext: formatHackathonContext(info),
            },
        });
    } catch (error) {
        console.error('Hackathon scrape error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to scrape hackathon URL' },
            { status: 500 }
        );
    }
}
