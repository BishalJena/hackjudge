import { Suspense } from 'react';
import { EvaluationClient } from './evaluation-client';

export const metadata = {
    title: 'Evaluating Project | HackJudge AI',
    description: 'AI-powered hackathon project evaluation in progress.',
};

export default function EvaluationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-terminal-black text-terminal-green font-mono flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-pulse text-2xl mb-4">INITIALIZING...</div>
                    <div className="text-terminal-dim text-sm">Loading evaluation system</div>
                </div>
            </div>
        }>
            <EvaluationClient />
        </Suspense>
    );
}
