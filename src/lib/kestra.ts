/**
 * Kestra API Helper
 * Utilities for interacting with Kestra workflow engine
 */

const KESTRA_API_URL = process.env.KESTRA_API_URL || 'http://localhost:8080/api/v1';
const KESTRA_NAMESPACE = process.env.KESTRA_NAMESPACE || 'hackjudge';

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
        const response = await fetch(
            `${KESTRA_API_URL}/executions/${KESTRA_NAMESPACE}/evaluate-hackathon-project`,
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
                    settings: JSON.stringify(params.settings || {}),
                }),
            }
        );

        if (!response.ok) {
            console.error('Kestra trigger failed:', response.status);
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
    const STEP_MAPPING: { kestraId: string; name: string }[] = [
        { kestraId: 'clone_repository', name: 'Clone Repository' },
        { kestraId: 'extract_metadata', name: 'Extract Metadata' },
        { kestraId: 'build_project', name: 'Build Project' },
        { kestraId: 'capture_screenshots', name: 'Capture Screenshots' },
        { kestraId: 'lighthouse_audit', name: 'Lighthouse Audit' },
        { kestraId: 'multi_agent_analysis', name: 'Multi-Agent Analysis' },
        { kestraId: 'aggregate_results', name: 'Generate Report' },
    ];

    const steps = STEP_MAPPING.map((step) => {
        const taskRun = execution.taskRunList?.find((tr) => tr.taskId === step.kestraId);

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

    const currentStep = steps.findIndex((s) => s.status === 'running' || s.status === 'pending');
    const completedSteps = steps.filter((s) => s.status === 'complete').length;

    // Generate logs from task runs
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
        currentStep: currentStep >= 0 ? currentStep : completedSteps,
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
 */
export async function checkKestraHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${KESTRA_API_URL.replace('/api/v1', '')}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        return response.ok;
    } catch {
        return false;
    }
}
