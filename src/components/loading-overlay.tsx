"use client";

import { Spinner } from "@/components/ui/spinner";

interface LoadingOverlayProps {
    message?: string;
}

export function LoadingOverlay({ message = "Running audit..." }: LoadingOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-card/90 border border-border/50 shadow-2xl">
                <Spinner className="w-12 h-12 text-primary" />
                <div className="text-center">
                    <p className="text-lg font-medium text-foreground">{message}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Analyzing your design for UX issues...
                    </p>
                </div>
                <div className="flex gap-1 mt-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        </div>
    );
}
