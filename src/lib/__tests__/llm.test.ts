/**
 * Unit Tests: LLM Utilities
 */

import {
    createLLMClient,
    getDefaultLLMClient,
    runAgent,
    runAgentsParallel,
    aggregateScores,
    AgentResult,
} from '@/lib/llm';

describe('LLM Utilities', () => {
    describe('createLLMClient', () => {
        it('should create a Together AI client', () => {
            const client = createLLMClient({
                provider: 'together',
                apiKey: 'test_key',
            });
            expect(client).toBeDefined();
            expect(client.chat).toBeDefined();
            expect(client.prompt).toBeDefined();
            expect(client.promptJSON).toBeDefined();
        });

        it('should create an OpenAI client', () => {
            const client = createLLMClient({
                provider: 'openai',
                apiKey: 'test_key',
            });
            expect(client).toBeDefined();
        });

        describe('chat method', () => {
            it('should send chat request and return response', async () => {
                const mockResponse = {
                    choices: [{ message: { content: 'Hello!' }, finish_reason: 'stop' }],
                    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
                    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
                };

                (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                });

                const client = createLLMClient({
                    provider: 'together',
                    apiKey: 'test_key',
                });

                const result = await client.chat([{ role: 'user', content: 'Hello' }]);
                expect(result.content).toBe('Hello!');
                expect(result.usage?.totalTokens).toBe(15);
            });

            it('should throw on API error', async () => {
                (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                    text: () => Promise.resolve('Unauthorized'),
                });

                const client = createLLMClient({
                    provider: 'together',
                    apiKey: 'invalid_key',
                });

                await expect(
                    client.chat([{ role: 'user', content: 'Hello' }])
                ).rejects.toThrow('LLM API error (401)');
            });
        });

        describe('prompt method', () => {
            it('should send a simple prompt and return content', async () => {
                const mockResponse = {
                    choices: [{ message: { content: 'Response text' } }],
                    model: 'test-model',
                };

                (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                });

                const client = createLLMClient({
                    provider: 'together',
                    apiKey: 'test_key',
                });

                const result = await client.prompt('Test prompt', 'System prompt');
                expect(result).toBe('Response text');
            });
        });

        describe('promptJSON method', () => {
            it('should parse JSON from response', async () => {
                const mockResponse = {
                    choices: [{ message: { content: '{"score": 85, "status": "good"}' } }],
                    model: 'test-model',
                };

                (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                });

                const client = createLLMClient({
                    provider: 'together',
                    apiKey: 'test_key',
                });

                const result = await client.promptJSON<{ score: number; status: string }>('Test');
                expect(result.score).toBe(85);
                expect(result.status).toBe('good');
            });

            it('should extract JSON from markdown code blocks', async () => {
                const mockResponse = {
                    choices: [{ message: { content: '```json\n{"value": 42}\n```' } }],
                    model: 'test-model',
                };

                (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                });

                const client = createLLMClient({
                    provider: 'together',
                    apiKey: 'test_key',
                });

                const result = await client.promptJSON<{ value: number }>('Test');
                expect(result.value).toBe(42);
            });

            it('should throw when no JSON found', async () => {
                const mockResponse = {
                    choices: [{ message: { content: 'No JSON here' } }],
                    model: 'test-model',
                };

                (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                });

                const client = createLLMClient({
                    provider: 'together',
                    apiKey: 'test_key',
                });

                await expect(client.promptJSON('Test')).rejects.toThrow('No JSON found');
            });
        });
    });

    describe('getDefaultLLMClient', () => {
        it('should return Together AI client when TOGETHER_API_KEY is set', () => {
            const client = getDefaultLLMClient();
            expect(client).not.toBeNull();
        });

        it('should return null when no API keys are set', () => {
            const originalTogetherKey = process.env.TOGETHER_API_KEY;
            const originalOpenAIKey = process.env.OPENAI_API_KEY;

            delete process.env.TOGETHER_API_KEY;
            delete process.env.OPENAI_API_KEY;

            const client = getDefaultLLMClient();
            expect(client).toBeNull();

            process.env.TOGETHER_API_KEY = originalTogetherKey;
            process.env.OPENAI_API_KEY = originalOpenAIKey;
        });
    });

    describe('runAgent', () => {
        it('should execute agent and return result', async () => {
            const mockResponse = {
                choices: [{
                    message: {
                        content: JSON.stringify({
                            score: 80,
                            confidence: 90,
                            strengths: ['Good code'],
                            weaknesses: ['Missing tests'],
                            judgeComment: 'Solid work',
                        }),
                    },
                }],
                model: 'test-model',
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse),
            });

            const client = createLLMClient({
                provider: 'together',
                apiKey: 'test_key',
            });

            const result = await runAgent('Test Agent', 'code_quality', 'Test prompt', client);

            expect(result.agentName).toBe('Test Agent');
            expect(result.agentType).toBe('code_quality');
            expect(result.score).toBe(80);
            expect(result.confidence).toBe(90);
        });

        it('should handle agent errors gracefully', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'));

            const client = createLLMClient({
                provider: 'together',
                apiKey: 'test_key',
            });

            const result = await runAgent('Test Agent', 'code_quality', 'Test prompt', client);

            expect(result.agentName).toBe('Test Agent');
            expect(result.score).toBe(60);
            expect(result.confidence).toBe(30);
            expect(result.error).toBeDefined();
        });
    });

    describe('runAgentsParallel', () => {
        it('should run multiple agents in parallel', async () => {
            const mockResponse = {
                choices: [{
                    message: {
                        content: JSON.stringify({
                            score: 75,
                            confidence: 85,
                            strengths: ['Good'],
                            weaknesses: ['Bad'],
                            judgeComment: 'OK',
                        }),
                    },
                }],
                model: 'test-model',
            };

            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) })
                .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse) });

            const client = createLLMClient({
                provider: 'together',
                apiKey: 'test_key',
            });

            const agents = [
                { name: 'Agent 1', type: 'code_quality', prompt: 'Prompt 1' },
                { name: 'Agent 2', type: 'ux', prompt: 'Prompt 2' },
            ];

            const results = await runAgentsParallel(agents, client);
            expect(results).toHaveLength(2);
            expect(results[0].agentName).toBe('Agent 1');
            expect(results[1].agentName).toBe('Agent 2');
        });
    });

    describe('aggregateScores', () => {
        it('should calculate weighted average of agent scores', () => {
            const agentResults: AgentResult[] = [
                {
                    agentName: 'Code Quality',
                    agentType: 'code_quality',
                    score: 80,
                    confidence: 90,
                    strengths: [],
                    weaknesses: [],
                    judgeComment: '',
                },
                {
                    agentName: 'UX',
                    agentType: 'ux',
                    score: 70,
                    confidence: 80,
                    strengths: [],
                    weaknesses: [],
                    judgeComment: '',
                },
            ];

            const result = aggregateScores(agentResults);
            expect(result.overall).toBeGreaterThan(0);
            expect(result.dimensions).toHaveProperty('code_quality', 80);
            expect(result.dimensions).toHaveProperty('ux', 70);
            expect(result.confidence).toBe(85);
        });

        it('should handle empty results', () => {
            const result = aggregateScores([]);
            expect(result.overall).toBe(70);
            expect(result.confidence).toBe(50);
        });
    });
});
