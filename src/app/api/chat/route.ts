/**
 * Chat API - Streaming chat with codebase context
 * Allows users to ask questions about their code and get AI-powered suggestions
 */
import { NextRequest } from 'next/server';
import { getEvaluationResult } from '@/lib/store';
import { needsWebSearch, searchExa, formatSearchContext } from '@/lib/exa';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const MODEL = 'google/gemini-2.0-flash-001';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function POST(request: NextRequest) {
    try {
        // Fail fast if API key is missing
        if (!OPENROUTER_API_KEY) {
            return new Response(JSON.stringify({ error: 'Server misconfigured: missing AI API key' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { projectId, messages, codeContext } = await request.json();

        if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: 'Messages required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Sanitize messages: only allow user/assistant roles, prevent system injection
        const safeMessages: ChatMessage[] = messages
            .filter((m: unknown): m is { role: string; content: string } =>
                typeof m === 'object' && m !== null &&
                (m as { role?: string }).role !== 'system' &&
                ((m as { role?: string }).role === 'user' || (m as { role?: string }).role === 'assistant') &&
                typeof (m as { content?: string }).content === 'string'
            )
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content.slice(0, 8000) }))
            .slice(-10);

        // Try to get evaluation result for context
        let evaluationContext = '';
        if (projectId) {
            const result = getEvaluationResult(projectId);
            if (result && 'readinessScore' in result) {
                evaluationContext = `
Project Analysis Summary:
- Readiness Score: ${result.readinessScore}/100
- Status: ${result.status}
- Strengths: ${result.strengths.join(', ')}
- Weaknesses: ${result.weaknesses.join(', ')}
`;
            }
        }

        // Build code context string from provided context
        let codeSnippets = '';
        if (codeContext?.files && Array.isArray(codeContext.files)) {
            codeSnippets = codeContext.files
                .filter((f: unknown): f is { path: string; content: string } =>
                    typeof f === 'object' && f !== null &&
                    typeof (f as { path?: unknown }).path === 'string' &&
                    typeof (f as { content?: unknown }).content === 'string'
                )
                .slice(0, 10) // Limit to 10 files
                .map((f: { path: string; content: string }) =>
                    `### ${f.path}\n\`\`\`\n${f.content.slice(0, 2000)}\n\`\`\``
                )
                .join('\n\n');
        }

        // Get the latest user message for web search
        const latestUserMessage = safeMessages.filter(m => m.role === 'user').pop()?.content || '';

        // Perform web search if needed
        let webSearchContext = '';
        if (needsWebSearch(latestUserMessage)) {
            const searchResults = await searchExa(latestUserMessage);
            if (searchResults) {
                webSearchContext = formatSearchContext(searchResults);
            }
        }

        // System prompt for code assistant - CONCISE and ACTIONABLE
        const systemPrompt = `You are HackJudge AI, a code assistant for hackathon projects. Be CONCISE and ACTIONABLE.

RULES:
- Maximum 200 words per response
- Give direct answers, skip pleasantries
- Provide code snippets when useful
- Reference specific file paths
- End with 1 clear next action when appropriate
- If web search results are provided, cite them with [Source](url) format

${evaluationContext}

${codeSnippets ? `## Code Context:\n${codeSnippets}` : ''}

${webSearchContext ? `## Web Search Results (cite these!):\n${webSearchContext}` : ''}

Capabilities:
- Explain code sections
- Suggest UI/UX improvements with latest best practices
- Debug issues
- Recommend implementation approaches
- Help with feature additions`;

        const chatMessages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...safeMessages,
        ];

        // Call OpenRouter with streaming (60s timeout)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                ...(process.env.NEXT_PUBLIC_APP_URL ? { 'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL } : {}),
                'X-Title': 'HackJudge AI',
            },
            body: JSON.stringify({
                model: MODEL,
                messages: chatMessages,
                stream: true,
                max_tokens: 500, // Reduced for concise responses
                temperature: 0.7,
            }),
            signal: AbortSignal.timeout(60_000),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenRouter error:', error);
            return new Response(JSON.stringify({ error: 'AI service error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Stream the response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') {
                                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                                continue;
                            }
                            try {
                                const json = JSON.parse(data);
                                const content = json.choices?.[0]?.delta?.content;
                                if (content) {
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                                }
                            } catch {
                                // Skip invalid JSON
                            }
                        }
                    }
                }

                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
