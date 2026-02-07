"use client";

import { IssueCard, type Issue } from "@/components/issue-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconAlertTriangle, IconX } from "@tabler/icons-react";

export interface AuditResult {
    issues: Issue[];
    overallScore: number;
}

interface AuditResultsProps {
    result: AuditResult;
    onReset: () => void;
}

function getScoreConfig(score: number) {
    if (score >= 80) {
        return {
            icon: IconCheck,
            label: "Good",
            color: "text-success",
            bgColor: "bg-success/10",
            progressColor: "bg-success",
        };
    } else if (score >= 50) {
        return {
            icon: IconAlertTriangle,
            label: "Needs Improvement",
            color: "text-warning",
            bgColor: "bg-warning/10",
            progressColor: "bg-warning",
        };
    } else {
        return {
            icon: IconX,
            label: "Critical Issues",
            color: "text-destructive",
            bgColor: "bg-destructive/10",
            progressColor: "bg-destructive",
        };
    }
}

export function AuditResults({ result, onReset }: AuditResultsProps) {
    const scoreConfig = getScoreConfig(result.overallScore);
    const Icon = scoreConfig.icon;

    const criticalCount = result.issues.filter((i) => i.severity === "critical").length;
    const warningCount = result.issues.filter((i) => i.severity === "warning").length;
    const infoCount = result.issues.filter((i) => i.severity === "info").length;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Score Summary Card */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold">Audit Results</CardTitle>
                        <button
                            onClick={onReset}
                            className="text-sm text-primary hover:underline underline-offset-4"
                        >
                            Run another audit
                        </button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Overall Score */}
                    <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl ${scoreConfig.bgColor}`}>
                            <div className="text-4xl font-bold text-foreground">{result.overallScore}</div>
                            <div className="text-xs text-muted-foreground mt-1">out of 100</div>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <Icon size={20} className={scoreConfig.color} />
                                <span className={`font-medium ${scoreConfig.color}`}>{scoreConfig.label}</span>
                            </div>
                            <Progress value={result.overallScore} className="h-3" />
                        </div>
                    </div>

                    {/* Issue Summary */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        {criticalCount > 0 && (
                            <Badge variant="destructive" className="gap-1.5 px-3 py-1.5">
                                <IconX size={14} />
                                {criticalCount} Critical
                            </Badge>
                        )}
                        {warningCount > 0 && (
                            <Badge variant="warning" className="gap-1.5 px-3 py-1.5">
                                <IconAlertTriangle size={14} />
                                {warningCount} Warnings
                            </Badge>
                        )}
                        {infoCount > 0 && (
                            <Badge variant="info" className="gap-1.5 px-3 py-1.5">
                                {infoCount} Info
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Issues List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                    Detected Issues ({result.issues.length})
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {result.issues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                    ))}
                </div>
            </div>
        </div>
    );
}
