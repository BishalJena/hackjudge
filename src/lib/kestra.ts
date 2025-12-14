/**
 * Kestra API Helper
 * Utilities for interacting with Kestra workflow engine
 */

const KESTRA_API_URL = process.env.KESTRA_API_URL || 'http://localhost:8080/api/v1';
const KESTRA_NAMESPACE = process.env.KESTRA_NAMESPACE || 'hackjudge';
const KESTRA_USERNAME = process.env.KESTRA_USERNAME || 'admin@kestra.io';
const KESTRA_PASSWORD = process.env.KESTRA_PASSWORD || 'Admin1234';

// Generate Basic Auth header
function getAuthHeader(): string {
    const credentials = Buffer.from(`${KESTRA_USERNAME}:${KESTRA_PASSWORD}`).toString('base64');
    return `Basic ${credentials}`;
}

export interface KesTraExecution {
    id: string;
    namespace: string;
    flowId: string;
    state: {
        current: 'CREATED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'KILLED' | 'WARNING';
        startDate: string;
        endDate?: string;
    };
    inputs?: Record<string, unknown>;
    outputs?: Record<string, unknown>;
    taskRunList?: TaskRun[];
}

export interface TaskRun {
    id: string;
    taskId: string;
    state: {
        current: 'CREATED' | 'RUNNING' | 'SUCCESS' | 'FAILED';
        startDate: string;
        endDate?: string;
    };
    outputs?: Record<string, unknown>;
}

/**
 * Trigger a new evaluation workflow
 */
export async function triggerEvaluation(params: {
    repoUrl: string;
    branch?: string;
    hackathonUrl?: string;
    jobId: string;
    settings?: Record<string, unknown>;
}): Promise<{ executionId: string } | null> {
    try {
        // Parse owner/repo from URL
        const match = params.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        const owner = match?.[1] || '';
        const repo = match?.[2]?.replace('.git', '') || '';

        // Use webhook endpoint (api_trigger with key hackjudge-evaluate)
        const response = await fetch(
            `${KESTRA_API_URL}/executions/webhook/${KESTRA_NAMESPACE}/evaluate-hackathon-project/hackjudge-evaluate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    repo_url: params.repoUrl,
                    branch: params.branch || 'main',
                    hackathon_url: params.hackathonUrl || '',
                    job_id: params.jobId,
                    owner,
                    repo,
                    settings: JSON.stringify(params.settings || {}),
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Kestra trigger failed:', response.status, errorText);
            return null;
        }

        const data: KesTraExecution = await response.json();
        return { executionId: data.id };
    } catch (error) {
        console.error('Error triggering Kestra workflow:', error);
        return null;
    }
}

/**
 * Get execution status
 */
export async function getExecutionStatus(
    executionId: string
): Promise<KesTraExecution | null> {
    try {
        const response = await fetch(
            `${KESTRA_API_URL}/executions/${executionId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': getAuthHeader(),
                },
            }
        );

        if (!response.ok) {
            console.error('Kestra status fetch failed:', response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching execution status:', error);
        return null;
    }
}

/**
 * Map Kestra task states to our step progress format
 */
export function mapExecutionToProgress(execution: KesTraExecution): {
    status: 'running' | 'complete' | 'failed';
    currentStep: number;
    totalSteps: number;
    steps: { id: string; name: string; status: 'pending' | 'running' | 'complete' | 'failed' }[];
    logs: string[];
} {
    // Updated to match actual Kestra workflow task IDs (nested inside evaluation_pipeline)
    const STEP_MAPPING: { kestraId: string; name: string }[] = [
        { kestraId: 'setup', name: 'Setting Up' },
        { kestraId: 'clone_repository', name: 'Cloning Repository' },
        { kestraId: 'security_scan', name: 'Security Scan' },
        { kestraId: 'analyze_project', name: 'Analyzing Project' },
        { kestraId: 'ai_summarize_analysis', name: 'AI Summary' },
        { kestraId: 'generate_report', name: 'Generating Report' },
    ];

    // Kestra nests tasks inside WorkingDirectory - flatten the task list
    const allTaskRuns = execution.taskRunList || [];

    const steps = STEP_MAPPING.map((step) => {
        // Find matching task (could be nested, check taskId)
        const taskRun = allTaskRuns.find((tr) => tr.taskId === step.kestraId);

        let status: 'pending' | 'running' | 'complete' | 'failed' = 'pending';
        if (taskRun) {
            switch (taskRun.state.current) {
                case 'SUCCESS':
                    status = 'complete';
                    break;
                case 'RUNNING':
                case 'CREATED':
                    status = 'running';
                    break;
                case 'FAILED':
                    status = 'failed';
                    break;
            }
        }

        return {
            id: step.kestraId,
            name: step.name,
            status,
        };
    });

    // Calculate current step - find first running or pending
    const runningIdx = steps.findIndex((s) => s.status === 'running');
    const pendingIdx = steps.findIndex((s) => s.status === 'pending');
    const completedSteps = steps.filter((s) => s.status === 'complete').length;

    // currentStep is the running step, or if none running, the first pending
    const currentStep = runningIdx >= 0 ? runningIdx : (pendingIdx >= 0 ? pendingIdx : completedSteps);

    // Generate logs from task runs - only add each step once
    const logs: string[] = [];
    for (const step of steps) {
        if (step.status === 'complete') {
            logs.push(`✓ ${step.name} completed`);
        } else if (step.status === 'running') {
            logs.push(`⋯ ${step.name}...`);
        } else if (step.status === 'failed') {
            logs.push(`✗ ${step.name} failed`);
        }
    }

    let status: 'running' | 'complete' | 'failed' = 'running';
    if (execution.state.current === 'SUCCESS') {
        status = 'complete';
    } else if (execution.state.current === 'FAILED') {
        status = 'failed';
    }

    return {
        status,
        currentStep,
        totalSteps: STEP_MAPPING.length,
        steps,
        logs,
    };
}

/**
 * Get execution outputs (final report)
 */
export async function getExecutionOutputs(
    executionId: string
): Promise<Record<string, unknown> | null> {
    try {
        const response = await fetch(
            `${KESTRA_API_URL}/executions/${executionId}/outputs`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': getAuthHeader(),
                },
            }
        );

        if (!response.ok) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching execution outputs:', error);
        return null;
    }
}

/**
 * Download artifact file from execution
 */
export async function downloadArtifact(
    executionId: string,
    path: string
): Promise<Blob | null> {
    try {
        const response = await fetch(
            `${KESTRA_API_URL}/executions/${executionId}/file?path=${encodeURIComponent(path)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': getAuthHeader(),
                },
            }
        );

        if (!response.ok) {
            return null;
        }

        return await response.blob();
    } catch (error) {
        console.error('Error downloading artifact:', error);
        return null;
    }
}

/**
 * Check if Kestra is available
 * Note: Kestra exposes management endpoints (health, metrics) on port 8081 by default
 */
export async function checkKestraHealth(): Promise<boolean> {
    try {
        // Kestra management API is on port 8081, not 8080
        // Parse the API URL to extract the host and construct health URL
        const apiUrl = new URL(KESTRA_API_URL);
        const healthUrl = `${apiUrl.protocol}//${apiUrl.hostname}:8081/health`;

        const response = await fetch(healthUrl, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.status === 'UP';
    } catch (error) {
        console.log('Kestra health check failed:', error);
        return false;
    }
}

/**
 * Kestra report structure (from final_report.json)
 */
export interface KestraReport {
    projectId: string;
    repoUrl: string;
    branch: string;
    readinessScore: number;
    status: 'STRONG' | 'GOOD' | 'NEEDS_WORK' | 'WEAK';
    summary: string;
    dimensions: {
        innovation: number;
        technical: number;
        ux: number;
        performance: number;
        codeQuality: number;
        presentation: number;
    };
    strengths: string[];
    weaknesses: string[];
    agentFeedback: Array<{
        agentName: string;
        agentType: string;
        score: number;
        confidence: number;
        strengths: string[];
        weaknesses: string[];
        judgeComment: string;
    }>;
    metadata: Record<string, unknown>;
    awardEligibility: Array<{
        name: string;
        eligible: boolean;
        reason?: string;
    }>;
    aiSummary?: {
        available: boolean;
        summary?: string;
        submissionReady?: string;
        topImprovements?: string[];
        eligibleTracks?: string[];
    };
    generatedContent: {
        devpostDraft: string;
        pitchScript: string;
        architectureDiagram: string;
    };
    // Phase 2 additions
    security?: {
        score: number;
        vulnerabilities: { critical: number; high: number; moderate: number; low: number };
        summary: string;
        hasPackageJson: boolean;
    };
    cicdStatus?: {
        hasCI: boolean;
        provider: string | null;
        hasDocker: boolean;
        hasDeployConfig: boolean;
        details: string[];
    };
    completedAt: string;
}

/**
 * Fetch the final report from a completed Kestra execution
 */
export async function fetchKestraReport(executionId: string): Promise<KestraReport | null> {
    try {
        // First, get the execution to find output file paths
        const execution = await getExecutionStatus(executionId);
        console.log('=== Kestra Report Fetch Debug ===');
        console.log('Execution ID:', executionId);
        console.log('Execution state:', execution?.state?.current);

        if (!execution) {
            console.log('ERROR: Execution not found');
            return null;
        }

        if (execution.state.current !== 'SUCCESS') {
            console.log('ERROR: Execution not successful, state:', execution.state.current);
            return null;
        }

        console.log('Task runs found:', execution.taskRunList?.length || 0);
        console.log('Task IDs:', execution.taskRunList?.map(tr => tr.taskId).join(', '));

        // Find the evaluation_pipeline task which has the output files
        const pipelineTask = execution.taskRunList?.find(
            (tr) => tr.taskId === 'evaluation_pipeline'
        );

        console.log('Pipeline task found:', !!pipelineTask);
        console.log('Pipeline task outputs:', pipelineTask?.outputs ? Object.keys(pipelineTask.outputs) : 'none');

        if (!pipelineTask?.outputs) {
            console.log('No pipeline outputs found, checking all tasks...');

            // Try to find any task with outputFiles
            for (const task of execution.taskRunList || []) {
                if (task.outputs) {
                    console.log(`Task ${task.taskId} has outputs:`, Object.keys(task.outputs));
                }
            }
            return null;
        }

        // The outputs contain file URIs, we need to find final_report.json
        const outputs = pipelineTask.outputs as Record<string, unknown>;
        console.log('Pipeline outputs structure:', JSON.stringify(outputs, null, 2));

        const outputFiles = outputs['outputFiles'] as Record<string, string> | undefined;

        if (!outputFiles) {
            console.log('No outputFiles key in pipeline task, available keys:', Object.keys(outputs));
            return null;
        }

        console.log('Output files found:', Object.keys(outputFiles));

        // Find the final_report.json file path
        let reportUri: string | undefined;
        for (const [filename, uri] of Object.entries(outputFiles)) {
            if (filename.includes('final_report.json')) {
                reportUri = uri;
                console.log('Found final_report.json at:', reportUri);
                break;
            }
        }

        if (!reportUri) {
            console.log('final_report.json not found in outputs:', Object.keys(outputFiles));
            return null;
        }

        // Try different API endpoints for downloading the file
        // The kestra:/// URI is an internal storage URI
        // Format: kestra:///namespace/flow/executions/id/tasks/task-id/attempt-id/filename

        // Try 1: Use the storages endpoint with the full URI
        let downloadUrl = `${KESTRA_API_URL}/storages?path=${encodeURIComponent(reportUri)}`;
        console.log('Attempting download from storages API:', downloadUrl);

        let response = await fetch(downloadUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': getAuthHeader(),
            },
        });

        console.log('Storages API response status:', response.status);

        // If storages API fails, try the file download with just the path portion
        if (!response.ok) {
            // Strip the kestra:// prefix if present
            const pathOnly = reportUri.replace(/^kestra:\/\//, '');
            downloadUrl = `${KESTRA_API_URL}/storages/download?path=${encodeURIComponent(pathOnly)}`;
            console.log('Trying storages download endpoint:', downloadUrl);

            response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': getAuthHeader(),
                },
            });
            console.log('Storages download response status:', response.status);
        }

        // If still failing, try with the kestra:// prefix but differently encoded
        if (!response.ok) {
            downloadUrl = `${KESTRA_API_URL}/storages?uri=${encodeURIComponent(reportUri)}`;
            console.log('Trying with uri param:', downloadUrl);

            response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': getAuthHeader(),
                },
            });
            console.log('URI param response status:', response.status);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to download final_report.json:', response.status, errorText);
            return null;
        }

        const report = await response.json();
        console.log('Successfully fetched Kestra report:', report.projectId);
        console.log('=== End Debug ===');
        return report as KestraReport;
    } catch (error) {
        console.error('Error fetching Kestra report:', error);
        return null;
    }
}

/**
 * Transform Kestra report to app's EvaluationResult format
 */
export function transformKestraReport(report: KestraReport): import('@/types').EvaluationResult {
    // Use AI summary if available, otherwise use the basic summary
    const summary = report.aiSummary?.available && report.aiSummary.summary
        ? report.aiSummary.summary
        : report.summary;

    // Transform agent feedback to include required fields
    const agentFeedback = report.agentFeedback.map((agent) => ({
        agentName: agent.agentName,
        agentType: agent.agentType as import('@/types').AgentType,
        score: agent.score,
        confidence: agent.confidence,
        strengths: agent.strengths || [],
        weaknesses: agent.weaknesses || [],
        judgeComment: agent.judgeComment || '',
        evidence: [], // Kestra doesn't provide this
        suggestions: [], // Kestra doesn't provide this
    }));

    // Generate improvements from AI topImprovements or weaknesses
    const improvements: import('@/types').Improvement[] = [];

    if (report.aiSummary?.topImprovements) {
        report.aiSummary.topImprovements.forEach((improvement, idx) => {
            improvements.push({
                rank: idx + 1,
                category: idx === 0 ? 'quick-win' : 'medium',
                title: improvement.slice(0, 60),
                issue: improvement,
                rootCause: 'Identified by AI analysis',
                impact: 10 - idx,  // Decreasing impact by rank (deterministic)
                effort: 2 + idx * 2,
                actionItems: [improvement],
            });
        });
    } else {
        // Fall back to generating from weaknesses
        report.weaknesses.slice(0, 5).forEach((weakness, idx) => {
            improvements.push({
                rank: idx + 1,
                category: idx < 2 ? 'quick-win' : 'medium',
                title: `Fix: ${weakness.slice(0, 50)}`,
                issue: weakness,
                rootCause: 'Code analysis finding',
                impact: 5,
                effort: 3,
                actionItems: [`Address: ${weakness}`],
            });
        });
    }

    // Transform award eligibility with confidence
    const awardEligibility = report.awardEligibility.map((award) => ({
        name: award.name,
        eligible: award.eligible,
        confidence: award.eligible ? 85 : 20,
        reason: award.reason,
    }));

    return {
        projectId: report.projectId,
        readinessScore: report.readinessScore,
        status: report.status,
        summary,
        dimensions: report.dimensions,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        agentFeedback,
        improvements,
        awardEligibility,
        generatedContent: report.generatedContent,
        // Phase 2: Security and CI/CD
        security: report.security ? {
            score: report.security.score,
            vulnerabilities: report.security.vulnerabilities,
            summary: report.security.summary,
        } : undefined,
        cicdStatus: report.cicdStatus,
        completedAt: new Date(report.completedAt),
    };
}
