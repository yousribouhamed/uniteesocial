"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IconLink } from "@tabler/icons-react";

interface AuditFormProps {
    onSubmit: (data: AuditFormData) => void;
    isLoading: boolean;
}

export interface AuditFormData {
    url?: string;
}

export function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
    const [url, setUrl] = useState("");

    const isValid = url.trim() !== "";

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!isValid || isLoading) return;

        onSubmit({
            url: url.trim() || undefined,
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-semibold">Start Your Audit</CardTitle>
                <CardDescription>
                    Enter a website URL to analyze
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* URL Input */}
                    <div className="space-y-2">
                        <Label htmlFor="url" className="flex items-center gap-2 text-sm font-medium">
                            <IconLink size={18} className="text-primary" />
                            Website URL
                        </Label>
                        <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isLoading}
                            className="h-11 bg-background/50"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={!isValid || isLoading}
                        className="w-full h-12 text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isLoading ? "Running Audit..." : "Run UX Audit"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

