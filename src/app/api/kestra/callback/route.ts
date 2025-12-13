/**
 * Kestra Callback API - Receives evaluation results from Kestra workflow
 * This is called by the send_callback step in the Kestra workflow
 */
import { NextRequest, NextResponse } from 'next/server';
import { storeEvaluationResult } from '@/lib/store';
import { transformKestraReport, KestraReport } from '@/lib/kestra';

export async function POST(request: NextRequest) {
    try {
        const report = await request.json() as KestraReport;

        console.log('=== Kestra Callback Received ===');
        console.log('Project ID:', report.projectId);
        console.log('Score:', report.readinessScore);
        console.log('Status:', report.status);

        // Transform and store the result
        const result = transformKestraReport(report);

        // Store by projectId (which is the jobId from trigger body)
        storeEvaluationResult(report.projectId, result);

        // Also generate a normalized projectId from repoUrl for report page lookup
        // e.g., "bishaljena-arsp-v1" from "https://github.com/BishalJena/ARSP-v1"
        const repoUrl = report.repoUrl || '';
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
            const normalizedId = `${match[1].toLowerCase()}-${match[2].toLowerCase().replace(/\.git$/, '')}`;
            storeEvaluationResult(normalizedId, result);
            console.log('Stored with normalized ID:', normalizedId);
        }

        console.log('=== Callback Complete ===');

        return NextResponse.json({
            success: true,
            message: 'Report received and stored',
            projectId: report.projectId,
            score: report.readinessScore,
        });
    } catch (error) {
        console.error('Kestra callback error:', error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}
