/**
 * Dashboard Page - Repo selection + Evaluation trigger
 */
import { Suspense } from 'react';
import { DashboardClient } from './dashboard-client';

export const metadata = {
    title: 'Dashboard | HackJudge AI',
    description: 'Select your repository and start the evaluation process.',
};

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardClient />
        </Suspense>
    );
}

function DashboardLoading() {
    return (
        <main className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">
                    <span className="text-[var(--color-text-secondary)]">&gt;</span> HackJudge Dashboard
                </h1>
                <div className="text-[var(--color-border)] font-mono text-sm mb-8 overflow-hidden">
                    ════════════════════════════════════════════════════════
                </div>
                <div className="text-[var(--color-text-dim)] animate-pulse">
                    Loading...
                </div>
            </div>
        </main>
    );
}
