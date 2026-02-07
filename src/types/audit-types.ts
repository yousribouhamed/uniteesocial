/**
 * Audit Types
 * Shared type definitions for the UX audit pipeline
 */

export interface RawIssue {
    title: string;
    severity: "critical" | "warning" | "info";
    location?: string;
    element?: string;
}

export interface EnrichedIssue extends RawIssue {
    id: string;
    description: string;
    recommendation: string;
    screenshot?: string;
}

export interface AuditResult {
    issues: EnrichedIssue[];
    overallScore: number;
    summary: string;
    analyzedUrl?: string;
    timestamp: string;
}

export interface AuditRequest {
    url?: string;
    screenshot?: File | Buffer;
    figmaLink?: string;
}

export interface AuditError {
    code: string;
    message: string;
    details?: string;
}
