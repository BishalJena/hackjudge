/**
 * Chat Panel Component - Chat with codebase
 * Floating panel for asking questions about the analyzed code
 */
'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatPanelProps {
    projectId: string;
    codeContext?: {
        files: Array<{ path: string; content: string; size: number }>;
        totalSnippets?: number;
    };
}

const suggestedQuestions = [
    'How can I improve my landing page?',
    'What are the main issues in my code?',
    'Suggest a better navigation structure',
    'How to add dark mode?',
];

export function ChatPanel({ projectId, codeContext }: ChatPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // ESC key to close dialog
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    messages: [...messages, { role: 'user', content: userMessage }],
                    codeContext,
                }),
            });

            if (!response.ok) {
                throw new Error('Chat request failed');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader');

            let assistantMessage = '';
            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        try {
                            const json = JSON.parse(data);
                            if (json.content) {
                                assistantMessage += json.content;
                                setMessages((prev) => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1] = {
                                        role: 'assistant',
                                        content: assistantMessage,
                                    };
                                    return newMessages;
                                });
                            }
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                type="button"
                aria-label={isOpen ? 'Close chat panel' : 'Open chat panel'}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg hover:bg-green-400 transition-all z-50"
            >
                {isOpen ? '✕' : '💬'}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Chat with Codebase"
                    className="fixed bottom-24 right-6 w-96 h-[500px] bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-lg shadow-2xl z-50 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-sm">Chat with Codebase</h3>
                            <p className="text-xs text-[var(--color-text-dim)]">
                                Ask questions about your code
                            </p>
                        </div>
                        <span className="text-xs text-green-400">
                            {codeContext?.totalSnippets || 0} files loaded
                        </span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {messages.length === 0 && (
                            <div className="text-center py-4">
                                <p className="text-[var(--color-text-dim)] text-sm mb-4">
                                    Ask anything about your codebase:
                                </p>
                                <div className="space-y-2">
                                    {suggestedQuestions.map((q, i) => (
                                        <button
                                            type="button"
                                            key={i}
                                            onClick={() => setInput(q)}
                                            className="block w-full text-left px-3 py-2 text-xs border border-[var(--color-border)] rounded hover:border-green-500 hover:text-green-400 transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded text-sm ${msg.role === 'user'
                                    ? 'bg-green-500/10 border border-green-500/30 ml-4'
                                    : 'bg-[var(--color-surface)] mr-4'
                                    }`}
                            >
                                <span className="text-xs text-[var(--color-text-dim)] block mb-1">
                                    {msg.role === 'user' ? 'You' : 'HackJudge AI'}
                                </span>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        ))}

                        {isLoading && messages[messages.length - 1]?.content === '' && (
                            <div className="flex items-center gap-2 text-[var(--color-text-dim)] text-sm">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Thinking...
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-[var(--color-border)]">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your code..."
                                className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="px-4 py-2 bg-green-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
