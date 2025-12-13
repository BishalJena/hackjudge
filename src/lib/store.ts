/**
 * In-memory store for evaluation results
 * In production, this would be replaced with a database (PostgreSQL, Redis, etc.)
 * 
 * Uses globalThis to ensure the store persists across module boundaries
 * in Next.js development mode (Turbopack) where API routes and pages
 * may run in separate module instances.
 */

import { EvaluationResult } from '@/types';

interface StoredEvaluation {
    jobId: string;
    projectId: string;
    repoUrl: string;
    status: 'pending' | 'running' | 'complete' | 'failed';
    result?: EvaluationResult;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Extend globalThis with our store type
declare global {
    // eslint-disable-next-line no-var
    var evaluationStore: Map<string, StoredEvaluation> | undefined;
}

// Use globalThis to persist across module hot-reloads and boundaries
const evaluationStore = globalThis.evaluationStore ?? new Map<string, StoredEvaluation>();
globalThis.evaluationStore = evaluationStore;

/**
 * Create a new evaluation entry
 */
export function createEvaluation(jobId: string, projectId: string, repoUrl: string): StoredEvaluation {
    const evaluation: StoredEvaluation = {
        jobId,
        projectId,
        repoUrl,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    evaluationStore.set(jobId, evaluation);
    return evaluation;
}

/**
 * Update evaluation status
 */
export function updateEvaluationStatus(jobId: string, status: StoredEvaluation['status']): void {
    const evaluation = evaluationStore.get(jobId);
    if (evaluation) {
        evaluation.status = status;
        evaluation.updatedAt = new Date();
    }
}

/**
 * Store evaluation result
 */
export function storeEvaluationResult(jobId: string, result: EvaluationResult): void {
    const evaluation = evaluationStore.get(jobId);
    if (evaluation) {
        evaluation.result = result;
        evaluation.status = 'complete';
        evaluation.updatedAt = new Date();
    } else {
        // Create entry if it doesn't exist
        evaluationStore.set(jobId, {
            jobId,
            projectId: result.projectId,
            repoUrl: '',
            status: 'complete',
            result,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
}

/**
 * Store evaluation error
 */
export function storeEvaluationError(jobId: string, error: string): void {
    const evaluation = evaluationStore.get(jobId);
    if (evaluation) {
        evaluation.error = error;
        evaluation.status = 'failed';
        evaluation.updatedAt = new Date();
    }
}

/**
 * Get evaluation by job ID
 */
export function getEvaluation(jobId: string): StoredEvaluation | undefined {
    return evaluationStore.get(jobId);
}

/**
 * Get evaluation result by job ID or project ID
 * Tries jobId first, then searches by projectId
 */
export function getEvaluationResult(idOrProjectId: string): EvaluationResult | undefined {
    // Try direct lookup by key (jobId)
    const directLookup = evaluationStore.get(idOrProjectId);
    if (directLookup?.result) {
        return directLookup.result;
    }

    // Search by projectId
    for (const evaluation of evaluationStore.values()) {
        if (evaluation.projectId === idOrProjectId && evaluation.result) {
            return evaluation.result;
        }
    }

    return undefined;
}

/**
 * Check if an evaluation exists
 */
export function hasEvaluation(jobId: string): boolean {
    return evaluationStore.has(jobId);
}

/**
 * Get all evaluations (for debugging)
 */
export function getAllEvaluations(): StoredEvaluation[] {
    return Array.from(evaluationStore.values());
}

/**
 * Clear old evaluations (cleanup)
 */
export function cleanupOldEvaluations(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [jobId, evaluation] of evaluationStore.entries()) {
        if (now - evaluation.createdAt.getTime() > maxAgeMs) {
            evaluationStore.delete(jobId);
            cleaned++;
        }
    }
    return cleaned;
}
