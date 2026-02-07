"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconAlertTriangle, IconAlertCircle, IconInfoCircle, IconBulb } from "@tabler/icons-react";

export interface Issue {
    id: string;
    title: string;
    severity: "critical" | "warning" | "info";
    description: string;
    recommendation: string;
    screenshot?: string;
}

interface IssueCardProps {
    issue: Issue;
}

const severityConfig = {
    critical: {
        icon: IconAlertCircle,
        label: "Critical",
        variant: "destructive" as const,
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
    },
    warning: {
        icon: IconAlertTriangle,
        label: "Warning",
        variant: "warning" as const,
        bgColor: "bg-warning/10",
        borderColor: "border-warning/30",
    },
    info: {
        icon: IconInfoCircle,
        label: "Info",
        variant: "info" as const,
        bgColor: "bg-info/10",
        borderColor: "border-info/30",
    },
};

export function IssueCard({ issue }: IssueCardProps) {
    const config = severityConfig[issue.severity];
    const Icon = config.icon;

    return (
        <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 border ${config.borderColor}`}>
            <CardHeader className={`pb-3 ${config.bgColor}`}>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <Icon size={20} className="text-foreground" />
                        </div>
                        <CardTitle className="text-base font-semibold leading-tight">
                            {issue.title}
                        </CardTitle>
                    </div>
                    <Badge variant={config.variant} className="shrink-0">
                        {config.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {issue.description}
                </p>

                {issue.screenshot && (
                    <div className="rounded-lg overflow-hidden border border-border">
                        <img
                            src={issue.screenshot}
                            alt={`Screenshot for ${issue.title}`}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                <div className="flex gap-3 p-3 rounded-lg bg-accent/30 border border-border/50">
                    <IconBulb size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Recommendation
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                            {issue.recommendation}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
