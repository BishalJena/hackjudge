/**
 * Hackathon URL Scraper - Extracts judging criteria from any hackathon site
 * Supports: DevPost, custom hackathon websites via AI extraction
 */

import { getDefaultLLMClient } from './llm';

export interface HackathonInfo {
    name: string;
    description: string;
    theme?: string;
    criteria: {
        name: string;
        weight?: number;
        description?: string;
    }[];
    prizes: {
        name: string;
        description?: string;
    }[];
    sponsors: string[];
    deadline?: string;
    source: 'devpost' | 'ai' | 'unknown';
}

/**
 * Scrape hackathon information from any URL
 */
export async function scrapeHackathonUrl(url: string): Promise<HackathonInfo | null> {
    if (!url) return null;

    try {
        const parsed = new URL(url);

        // Fetch the page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'HackJudge AI (hackathon evaluation tool)',
                'Accept': 'text/html',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch hackathon page:', response.status);
            return null;
        }

        const html = await response.text();

        // Try DevPost-specific parsing first
        if (parsed.hostname.includes('devpost.com')) {
            return parseDevPostPage(html, url);
        }

        // For other sites, use AI extraction
        return await extractWithAI(html, url);
    } catch (error) {
        console.error('Error scraping hackathon URL:', error);
        return null;
    }
}

/**
 * Use LLM to extract hackathon info from any page
 */
async function extractWithAI(html: string, url: string): Promise<HackathonInfo | null> {
    // Clean HTML - remove scripts, styles, keep text
    const cleanedText = stripHtmlToText(html);

    // Limit to first 6000 chars to stay within context
    const excerpt = cleanedText.slice(0, 6000);

    const prompt = `Extract hackathon information from this webpage. Return JSON only.

URL: ${url}

PAGE CONTENT:
${excerpt}

Extract and return as JSON:
{
  "name": "hackathon name",
  "description": "brief description",
  "theme": "hackathon theme if mentioned",
  "criteria": [
    {"name": "criterion name", "weight": percentage or null, "description": "details"}
  ],
  "prizes": [
    {"name": "prize name", "description": "prize details"}
  ],
  "sponsors": ["sponsor1", "sponsor2"],
  "deadline": "submission deadline if found"
}

If judging criteria aren't explicitly listed, infer common hackathon criteria.
Return ONLY valid JSON, no other text.`;

    try {
        const llmClient = getDefaultLLMClient();
        if (!llmClient) {
            console.error('No LLM client available');
            return getDefaultHackathonInfo(url);
        }

        const response = await llmClient.prompt(prompt);

        // Parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in LLM response');
            return getDefaultHackathonInfo(url);
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            name: parsed.name || 'Hackathon',
            description: parsed.description || '',
            theme: parsed.theme,
            criteria: parsed.criteria || [],
            prizes: parsed.prizes || [],
            sponsors: parsed.sponsors || [],
            deadline: parsed.deadline,
            source: 'ai',
        };
    } catch (error) {
        console.error('LLM extraction failed:', error);
        return getDefaultHackathonInfo(url);
    }
}

/**
 * Get default hackathon info when extraction fails
 */
function getDefaultHackathonInfo(url: string): HackathonInfo {
    return {
        name: new URL(url).hostname.replace('www.', ''),
        description: '',
        criteria: [
            { name: 'Innovation', weight: 25 },
            { name: 'Technical Implementation', weight: 25 },
            { name: 'Design & UX', weight: 20 },
            { name: 'Impact & Usefulness', weight: 20 },
            { name: 'Presentation', weight: 10 },
        ],
        prizes: [],
        sponsors: [],
        source: 'unknown',
    };
}

/**
 * Parse DevPost HTML to extract hackathon info
 */
function parseDevPostPage(html: string, url: string): HackathonInfo {
    const info: HackathonInfo = {
        name: extractText(html, /<h1[^>]*>([^<]+)<\/h1>/) || 'Hackathon',
        description: extractText(html, /<meta name="description" content="([^"]+)"/) || '',
        criteria: [],
        prizes: [],
        sponsors: [],
        source: 'devpost',
    };

    // Extract theme from meta or title
    const themeMatch = html.match(/theme[:\s]*"?([^"<]+)"?/i);
    if (themeMatch) {
        info.theme = themeMatch[1].trim();
    }

    // Extract judging criteria section
    const criteriaSection = html.match(/judging\s*criteria[^<]*<[^>]+>([\s\S]*?)(?:<h2|<\/section)/i);
    if (criteriaSection) {
        const criteriaItems = criteriaSection[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
        for (const item of criteriaItems) {
            const text = stripHtml(item[1]);
            if (text) {
                const weightMatch = text.match(/(\d+)%/);
                info.criteria.push({
                    name: text.replace(/\s*\d+%.*$/, '').trim(),
                    weight: weightMatch ? parseInt(weightMatch[1]) : undefined,
                    description: text,
                });
            }
        }
    }

    // If no criteria found, use defaults
    if (info.criteria.length === 0) {
        info.criteria = [
            { name: 'Innovation', weight: 25 },
            { name: 'Technical Implementation', weight: 25 },
            { name: 'Design & UX', weight: 20 },
            { name: 'Impact & Usefulness', weight: 20 },
            { name: 'Presentation', weight: 10 },
        ];
    }

    // Extract prizes
    const prizesSection = html.match(/prizes?[^<]*<[^>]+>([\s\S]*?)(?:<h2|<\/section)/i);
    if (prizesSection) {
        const prizeItems = prizesSection[1].matchAll(/<h[34][^>]*>([^<]+)<\/h[34]>/gi);
        for (const item of prizeItems) {
            const text = stripHtml(item[1]);
            if (text && !text.toLowerCase().includes('about')) {
                info.prizes.push({ name: text.trim() });
            }
        }
    }

    // Extract sponsors
    const sponsorSection = html.match(/sponsors?[^<]*<[^>]+>([\s\S]*?)(?:<h2|<\/section)/i);
    if (sponsorSection) {
        const sponsorImgs = sponsorSection[1].matchAll(/alt="([^"]+)"/gi);
        for (const img of sponsorImgs) {
            if (img[1] && !img[1].toLowerCase().includes('logo')) {
                info.sponsors.push(img[1].trim());
            }
        }
    }

    // Extract deadline
    const deadlineMatch = html.match(/submission[s]?\s*deadline[:\s]*([^<]+)/i);
    if (deadlineMatch) {
        info.deadline = deadlineMatch[1].trim();
    }

    return info;
}

/**
 * Extract text using regex
 */
function extractText(html: string, pattern: RegExp): string | null {
    const match = html.match(pattern);
    return match ? stripHtml(match[1]) : null;
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Convert HTML to plain text for AI processing
 */
function stripHtmlToText(html: string): string {
    return html
        // Remove script and style elements
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        // Remove HTML comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Add newlines for block elements
        .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        // Strip remaining tags
        .replace(/<[^>]*>/g, ' ')
        // Decode entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        // Clean whitespace
        .replace(/\s+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .trim();
}

/**
 * Format hackathon info for AI context
 */
export function formatHackathonContext(info: HackathonInfo): string {
    let context = `## Hackathon: ${info.name}\n\n`;

    if (info.description) {
        context += `**Description:** ${info.description}\n\n`;
    }

    if (info.theme) {
        context += `**Theme:** ${info.theme}\n\n`;
    }

    context += `### Judging Criteria\n`;
    for (const criterion of info.criteria) {
        context += `- **${criterion.name}**`;
        if (criterion.weight) {
            context += ` (${criterion.weight}%)`;
        }
        if (criterion.description && criterion.description !== criterion.name) {
            context += `: ${criterion.description}`;
        }
        context += '\n';
    }

    if (info.prizes.length > 0) {
        context += `\n### Prizes\n`;
        for (const prize of info.prizes) {
            context += `- ${prize.name}\n`;
        }
    }

    if (info.sponsors.length > 0) {
        context += `\n### Sponsors\n`;
        context += info.sponsors.join(', ') + '\n';
    }

    return context;
}
