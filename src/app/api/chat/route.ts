/**
 * Chat API - Streaming chat with codebase context
 * Allows users to ask questions about their code and get AI-powered suggestions
 */
import { NextRequest } from 'next/server';
import { getEvaluationResult } from '@/lib/store';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const MODEL = 'google/gemini-2.0-flash-001';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export async function POST(request: NextRequest) {
    try {
        const { projectId, messages, codeContext } = await request.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

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
                .slice(0, 10) // Limit to 10 files
                .map((f: { path: string; content: string }) =>
                    `### ${f.path}\n\`\`\`\n${f.content.slice(0, 2000)}\n\`\`\``
                )
                .join('\n\n');
        }

        // System prompt for code assistant - CONCISE and ACTIONABLE
        const systemPrompt = `You are HackJudge AI, a code assistant for hackathon projects. Be CONCISE and ACTIONABLE.

RULES:
- Maximum 200 words per response
- Give direct answers, skip pleasantries
- Provide code snippets when useful
- Reference specific file paths
- End with 1 clear next action when appropriate

${evaluationContext}

${codeSnippets ? `## Code Context:\n${codeSnippets}` : ''}

Capabilities:
- Explain code sections
- Suggest UI/UX improvements
- Debug issues
- Recommend implementation approaches
- Help with feature additions`;

        const chatMessages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10), // Last 10 messages for context
        ];

        // Call OpenRouter with streaming (60s timeout)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
