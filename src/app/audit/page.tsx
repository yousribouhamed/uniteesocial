"use client";

import { useState } from "react";
import { AuditForm, type AuditFormData } from "@/components/audit-form";
import { AuditResults, type AuditResult } from "@/components/audit-results";
import { LoadingOverlay } from "@/components/loading-overlay";
import { IconEye, IconWand, IconChartBar } from "@tabler/icons-react";

export default function AuditPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AuditResult | null>(null);

    const handleSubmit = async (data: AuditFormData) => {
        setIsLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            if (data.url) formData.append("url", data.url);

            const response = await fetch("/api/audit", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Audit request failed");
            }

            const auditResult: AuditResult = await response.json();
            setResult(auditResult);
        } catch (error) {
            console.error("Audit error:", error);
            // TODO: Show error toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
            {isLoading && <LoadingOverlay />}

            <div className="container mx-auto px-4 py-12 md:py-20">
                {!result ? (
                    <div className="space-y-12">
                        {/* Hero Section */}
                        <div className="text-center max-w-3xl mx-auto space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                <IconWand size={16} />
                                AI-Powered UX Analysis
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                                UX/UI{" "}
                                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Audit Tool
                                </span>
                            </h1>
                            <div className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                                Get instant, actionable feedback on your designs. Identify accessibility issues,
                                usability problems, and opportunities to improve user experience.
                            </div>
                        </div>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                            {[
                                { icon: IconEye, label: "Accessibility Check" },
                                { icon: IconChartBar, label: "UX Scoring" },
                                { icon: IconWand, label: "Smart Recommendations" },
                            ].map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50 text-sm"
                                >
                                    <Icon size={16} className="text-primary" />
                                    <span className="text-foreground">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Audit Form */}
                        <AuditForm onSubmit={handleSubmit} isLoading={isLoading} />
                    </div>
                ) : (
                    <AuditResults result={result} onReset={handleReset} />
                )}
            </div>
        </div>
    );
}
