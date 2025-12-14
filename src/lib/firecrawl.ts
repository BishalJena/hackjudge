/**
 * Firecrawl Integration - Fast, reliable web scraping
 * Uses Firecrawl for JS-rendered pages and clean markdown output
 */

const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/scrape';
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

export interface FirecrawlResult {
    success: boolean;
    markdown?: string;
    html?: string;
    metadata?: {
        title?: string;
        description?: string;
        language?: string;
        sourceURL?: string;
    };
    error?: string;
}

/**
 * Scrape a URL using Firecrawl
 * Returns clean markdown content, perfect for LLM processing
 */
export async function scrapeWithFirecrawl(url: string, options?: {
    formats?: ('markdown' | 'html' | 'links')[];
    waitFor?: number; // ms to wait for JS rendering
    timeout?: number;
}): Promise<FirecrawlResult> {
    if (!FIRECRAWL_API_KEY) {
        console.warn('FIRECRAWL_API_KEY not configured - using fallback');
        return { success: false, error: 'API key not configured' };
    }

    try {
        const response = await fetch(FIRECRAWL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            },
            body: JSON.stringify({
                url,
                formats: options?.formats || ['markdown'],
                waitFor: options?.waitFor || 1000,
                timeout: options?.timeout || 30000,
                // Include metadata for title/description
                includePaths: [],
                excludePaths: [],
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Firecrawl error:', response.status, errorText);
            return {
                success: false,
                error: `Firecrawl API error: ${response.status}`
            };
        }

        const data = await response.json();

        if (!data.success) {
            return {
                success: false,
                error: data.error || 'Scraping failed'
            };
        }

        return {
            success: true,
            markdown: data.data?.markdown || data.markdown,
            html: data.data?.html || data.html,
            metadata: data.data?.metadata || data.metadata,
        };
    } catch (error) {
        console.error('Firecrawl request failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Check if Firecrawl is configured and available
 */
export function isFirecrawlConfigured(): boolean {
    return !!FIRECRAWL_API_KEY;
}

/**
 * Extract clean text from Firecrawl markdown
 * Useful for LLM context windows
 */
export function extractTextFromMarkdown(markdown: string, maxLength?: number): string {
    // Remove markdown formatting for pure text
    let text = markdown
        .replace(/!\[.*?\]\(.*?\)/g, '')  // Remove images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Convert links to text
        .replace(/#{1,6}\s+/g, '')  // Remove headings markers
        .replace(/\*\*|__/g, '')  // Remove bold
        .replace(/\*|_/g, '')  // Remove italic
        .replace(/`{1,3}[^`]*`{1,3}/g, '')  // Remove code blocks
        .replace(/\n{3,}/g, '\n\n')  // Normalize newlines
        .trim();

    if (maxLength && text.length > maxLength) {
        text = text.slice(0, maxLength) + '...';
    }

    return text;
}
