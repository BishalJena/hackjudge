/**
 * Exa Search Integration - Web search for improved developer suggestions
 * Uses Exa's neural search to find relevant code examples, docs, and best practices
 */

const EXA_API_URL = 'https://api.exa.ai/search';
const EXA_API_KEY = process.env.EXA_API_KEY;

export interface ExaSearchResult {
    title: string;
    url: string;
    snippet: string;
    publishedDate?: string;
}

export interface ExaSearchResponse {
    results: ExaSearchResult[];
    searchType: string;
    query: string;
}

/**
 * Determines if a query needs web search based on keywords
 */
export function needsWebSearch(query: string): boolean {
    const searchTriggers = [
        'how to', 'how do i', 'best practice', 'best way',
        'improve', 'optimize', 'fix', 'solve', 'implement',
        'example', 'tutorial', 'guide', 'documentation',
        'latest', 'modern', '2024', '2025',
        'performance', 'security', 'accessibility',
        'next.js', 'react', 'typescript', 'tailwind',
        'what is', 'explain', 'why'
    ];

    const lowerQuery = query.toLowerCase();
    return searchTriggers.some(trigger => lowerQuery.includes(trigger));
}

/**
 * Search Exa for developer-focused content
 */
export async function searchExa(query: string, options?: {
    numResults?: number;
    category?: 'github' | 'news' | 'pdf';
    includeDomains?: string[];
}): Promise<ExaSearchResponse | null> {
    if (!EXA_API_KEY) {
        console.warn('EXA_API_KEY not configured - skipping web search');
        return null;
    }

    try {
        // Focus on code and documentation
        const includeDomains = options?.includeDomains || [
            'github.com',
            'stackoverflow.com',
            'dev.to',
            'medium.com',
            'web.dev',
            'nextjs.org',
            'react.dev',
            'vercel.com',
            'mdn.mozilla.org',
        ];

        const response = await fetch(EXA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': EXA_API_KEY,
            },
            body: JSON.stringify({
                query,
                type: 'auto',
                numResults: options?.numResults || 5,
                includeDomains,
                startPublishedDate: '2023-01-01T00:00:00.000Z', // Recent content only
                contents: {
                    highlights: {
                        numSentences: 2,
                        highlightsPerUrl: 2,
                        query: query, // Use query for relevant snippets
                    },
                },
            }),
        });

        if (!response.ok) {
            console.error('Exa search error:', response.status);
            return null;
        }

        const data = await response.json();

        return {
            results: data.results?.map((r: {
                title: string;
                url: string;
                highlights?: string[];
                text?: string;
                publishedDate?: string;
            }) => ({
                title: r.title || '',
                url: r.url || '',
                snippet: r.highlights?.join(' ') || r.text?.slice(0, 300) || '',
                publishedDate: r.publishedDate,
            })) || [],
            searchType: data.resolvedSearchType || 'auto',
            query,
        };
    } catch (error) {
        console.error('Exa search failed:', error);
        return null;
    }
}

/**
 * Format search results for LLM context
 */
export function formatSearchContext(results: ExaSearchResponse): string {
    if (!results.results.length) {
        return '';
    }

    let context = '\n\n📚 **Web Search Results:**\n';

    for (const result of results.results.slice(0, 3)) {
        context += `\n**[${result.title}](${result.url})**\n`;
        if (result.snippet) {
            context += `> ${result.snippet.trim()}\n`;
        }
    }

    return context;
}

/**
 * Format search results for inline display in chat
 */
export function formatSearchForChat(results: ExaSearchResponse): string {
    if (!results.results.length) {
        return '';
    }

    let formatted = '\n\n---\n📚 **Sources:**\n';

    for (const result of results.results.slice(0, 3)) {
        const domain = new URL(result.url).hostname.replace('www.', '');
        formatted += `• [${result.title.slice(0, 50)}...](${result.url}) - *${domain}*\n`;
    }

    return formatted;
}
