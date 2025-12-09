/**
 * Report Page - Full evaluation report display
 */
import { ReportClient } from './report-client';
import { getMockEvaluationResult } from '@/lib/mock-data';

export const metadata = {
    title: 'Project Report | HackJudge AI',
    description: 'Your hackathon project evaluation report with AI-powered insights.',
};

interface ReportPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
    const { projectId } = await params;

    // In production, fetch real data from API
    // For now, use mock data
    const result = getMockEvaluationResult(projectId);

    return <ReportClient result={result} projectId={projectId} />;
}
