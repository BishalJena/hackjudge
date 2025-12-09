/**
 * Evaluate API - Trigger new project evaluation
 */
import { NextRequest, NextResponse } from 'next/server';
import { isValidGitHubUrl, parseGitHubUrl, getRepoInfo } from '@/lib/github';
import { triggerEvaluation, checkKestraHealth } from '@/lib/kestra';

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
        const branch = body.branch || repoInfo.defaultBranch;

        // Check if Kestra is available
        const kestraAvailable = await checkKestraHealth();
        let executionId: string | null = null;
        let mode: 'kestra' | 'mock' = 'mock';

        if (kestraAvailable) {
            // Trigger Kestra workflow
            const result = await triggerEvaluation({
                repoUrl: body.repoUrl,
                branch,
                hackathonUrl: body.hackathonUrl,
                jobId,
                settings: body.settings,
            });

            if (result) {
                executionId = result.executionId;
                mode = 'kestra';
                console.log(`Kestra execution started: ${executionId}`);
            }
        } else {
            console.log('Kestra not available, using mock mode');
        }

        // Return job info
        return NextResponse.json({
            success: true,
            data: {
                jobId,
                executionId,
                mode,
                projectId: `${parsed.owner}-${parsed.repo}`,
                status: 'queued',
                repoInfo: {
                    name: repoInfo.name,
                    fullName: repoInfo.fullName,
                    defaultBranch: repoInfo.defaultBranch,
                    language: repoInfo.language,
                },
                settings: {
                    branch,
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

