/**
 * LLM API Integration
 * Unified interface for Together AI, OpenAI, and OpenRouter APIs
 */

export interface LLMConfig {
    provider: 'together' | 'openai' | 'openrouter';
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    model: string;
    finishReason?: string;
}

// Default models
const DEFAULT_MODELS = {
    together: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    openai: 'gpt-4-turbo-preview',
    openrouter: 'meta-llama/llama-3.1-70b-instruct',
};

// API endpoints
const API_ENDPOINTS = {
    together: 'https://api.together.xyz/v1/chat/completions',
    openai: 'https://api.openai.com/v1/chat/completions',
    openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

/**
 * Create an LLM client
 */
export function createLLMClient(config: LLMConfig) {
    const { provider, apiKey, model, temperature = 0.3, maxTokens = 2000 } = config;

    return {
        /**
         * Send a chat completion request
         */
        async chat(messages: LLMMessage[]): Promise<LLMResponse> {
            const endpoint = API_ENDPOINTS[provider];
            const selectedModel = model || DEFAULT_MODELS[provider];

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            };

            // OpenRouter requires additional headers
            if (provider === 'openrouter') {
                headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                headers['X-Title'] = 'HackJudge AI';
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model: selectedModel,
                    messages,
                    temperature,
                    max_tokens: maxTokens,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`LLM API error (${response.status}): ${error}`);
            }

            const data = await response.json();

            return {
                content: data.choices[0]?.message?.content || '',
                usage: data.usage
                    ? {
                        promptTokens: data.usage.prompt_tokens,
                        completionTokens: data.usage.completion_tokens,
                        totalTokens: data.usage.total_tokens,
                    }
                    : undefined,
                model: data.model,
                finishReason: data.choices[0]?.finish_reason,
            };
        },

        /**
         * Send a simple prompt and get a response
         */
        async prompt(userPrompt: string, systemPrompt?: string): Promise<string> {
            const messages: LLMMessage[] = [];

            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: userPrompt });

            const response = await this.chat(messages);
            return response.content;
        },

        /**
         * Send a prompt and parse the response as JSON
         */
        async promptJSON<T = Record<string, unknown>>(
            userPrompt: string,
            systemPrompt?: string
        ): Promise<T> {
            const content = await this.prompt(userPrompt, systemPrompt);

            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in LLM response');
            }

            try {
                return JSON.parse(jsonMatch[0]) as T;
            } catch (error) {
                throw new Error(`Failed to parse LLM response as JSON: ${error}`);
            }
        },
    };
}

/**
 * Check if an API key is a valid key (not a placeholder)
 */
function isValidApiKey(key: string | undefined): key is string {
    if (!key) return false;
    // Skip placeholder values like "your_together_ai_key", "your_api_key", etc.
    if (key.startsWith('your_') || key.includes('your_')) return false;
    // Skip empty or whitespace-only keys
    if (key.trim().length === 0) return false;
    // Skip obvious placeholder patterns
    if (key.toLowerCase().includes('placeholder') || key.toLowerCase().includes('example')) return false;
    return true;
}

/**
 * Get default LLM client from environment variables
 * Priority: Together AI → OpenRouter → OpenAI
 */
export function getDefaultLLMClient() {
    const togetherKey = process.env.TOGETHER_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Priority: Together AI first (sponsor tool)
    if (isValidApiKey(togetherKey)) {
        return createLLMClient({
            provider: 'together',
            apiKey: togetherKey,
        });
    }

    // Fallback: OpenRouter
    if (isValidApiKey(openrouterKey)) {
        return createLLMClient({
            provider: 'openrouter',
            apiKey: openrouterKey,
        });
    }

    // Fallback: OpenAI
    if (isValidApiKey(openaiKey)) {
        return createLLMClient({
            provider: 'openai',
            apiKey: openaiKey,
        });
    }

    return null;
}

/**
 * Agent execution result
 */
export interface AgentResult {
    agentName: string;
    agentType: string;
    score: number;
    confidence: number;
    strengths: string[];
    weaknesses: string[];
    judgeComment: string;
    evidence?: { file: string; line?: number; issue: string }[];
    suggestions?: string[];
    executionTime?: number;
    error?: string;
}

/**
 * Run a single agent evaluation
 */
export async function runAgent(
    agentName: string,
    agentType: string,
    prompt: string,
    llmClient: ReturnType<typeof createLLMClient>
): Promise<AgentResult> {
    const startTime = Date.now();

    try {
        const result = await llmClient.promptJSON<AgentResult>(prompt);

        return {
            agentName,
            agentType,
            score: result.score || 70,
            confidence: result.confidence || 80,
            strengths: result.strengths || [],
            weaknesses: result.weaknesses || [],
            judgeComment: result.judgeComment || 'Evaluation complete.',
            evidence: result.evidence,
            suggestions: result.suggestions,
            executionTime: Date.now() - startTime,
        };
    } catch (error) {
        console.error(`Agent ${agentName} failed:`, error);

        return {
            agentName,
            agentType,
            score: 60,
            confidence: 30,
            strengths: [],
            weaknesses: ['Agent evaluation failed'],
            judgeComment: 'Unable to complete evaluation due to an error.',
            error: String(error),
            executionTime: Date.now() - startTime,
        };
    }
}

/**
 * Run multiple agents in parallel
 */
export async function runAgentsParallel(
    agents: { name: string; type: string; prompt: string }[],
    llmClient: ReturnType<typeof createLLMClient>
): Promise<AgentResult[]> {
    const results = await Promise.allSettled(
        agents.map((agent) => runAgent(agent.name, agent.type, agent.prompt, llmClient))
    );

    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        }

        return {
            agentName: agents[index].name,
            agentType: agents[index].type,
            score: 50,
            confidence: 0,
            strengths: [],
            weaknesses: ['Agent execution failed'],
            judgeComment: 'Agent could not be executed.',
            error: String(result.reason),
        };
    });
}

/**
 * Calculate aggregate scores from agent results
 */
export function aggregateScores(
    agentResults: AgentResult[],
    weights?: Record<string, number>
): {
    overall: number;
    dimensions: Record<string, number>;
    confidence: number;
} {
    const defaultWeights: Record<string, number> = {
        code_quality: 0.20,
        ux: 0.15,
        performance: 0.15,
        product: 0.15,
        presentation: 0.15,
        sponsor: 0.10,
        technical: 0.10,
    };

    const appliedWeights = { ...defaultWeights, ...weights };

    const dimensions: Record<string, number> = {};
    let totalWeight = 0;
    let weightedSum = 0;
    let totalConfidence = 0;

    for (const result of agentResults) {
        const weight = appliedWeights[result.agentType] || 0.1;
        dimensions[result.agentType] = result.score;
        weightedSum += result.score * weight;
        totalWeight += weight;
        totalConfidence += result.confidence;
    }

    return {
        overall: totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 70,
        dimensions,
        confidence: agentResults.length > 0
            ? Math.round(totalConfidence / agentResults.length)
            : 50,
    };
}
