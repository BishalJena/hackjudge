/**
 * Evaluate API - Trigger new project evaluation
 */
import { NextRequest, NextResponse } from 'next/server';
import { isValidGitHubUrl, parseGitHubUrl, getRepoInfo } from '@/lib/github';

interface EvaluateRequest {
    repoUrl: string;
    branch?: string;
    hackathonUrl?: string;
    settings?: {
        buildType?: 'full' | 'quick';
        timeout?: number;
        skipLighthouse?: boolean;
        skipScreenshots?: boolean;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: EvaluateRequest = await request.json();

        // Validate repo URL
        if (!body.repoUrl || !isValidGitHubUrl(body.repoUrl)) {
            return NextResponse.json(
                { success: false, error: 'Invalid GitHub repository URL' },
                { status: 400 }
            );
        }

        // Parse repo info
        const parsed = parseGitHubUrl(body.repoUrl);
        if (!parsed) {
            return NextResponse.json(
                { success: false, error: 'Could not parse repository URL' },
                { status: 400 }
            );
        }

        // Verify repo exists and is accessible
        const token = request.cookies.get('github_token')?.value;
        const repoInfo = await getRepoInfo(parsed.owner, parsed.repo, token);

        if (!repoInfo) {
            return NextResponse.json(
                { success: false, error: 'Repository not found or not accessible' },
                { status: 404 }
            );
        }

        // Generate job ID
        const jobId = `eval_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // In production, this would:
        // 1. Store the job in database
        // 2. Trigger Kestra workflow via API
        // 3. Return job ID for status polling

        // For demo, return success with job ID
        return NextResponse.json({
            success: true,
            data: {
                jobId,
                projectId: `${parsed.owner}-${parsed.repo}`,
                status: 'queued',
                repoInfo: {
                    name: repoInfo.name,
                    fullName: repoInfo.fullName,
                    defaultBranch: repoInfo.defaultBranch,
                    language: repoInfo.language,
                },
                settings: {
                    branch: body.branch || repoInfo.defaultBranch,
                    buildType: body.settings?.buildType || 'full',
                    timeout: body.settings?.timeout || 5,
                    skipLighthouse: body.settings?.skipLighthouse || false,
                    skipScreenshots: body.settings?.skipScreenshots || false,
                },
                createdAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Evaluate API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
