/**
 * Audit API Route
 * Code/Content-based UX audit using standard Fetch + Claude
 */

import { NextRequest, NextResponse } from "next/server";
import { mergeAndScore, analyzeUIWithClaude } from "@/lib/anthropic";
import type { AuditResult, AuditError } from "@/types/audit-types";

export const maxDuration = 60; // Allow up to 60 seconds

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const url = formData.get("url") as string | null;

        // Validate: at least one input must be provided
        if (!url) {
            const error: AuditError = {
                code: "MISSING_INPUT",
                message: "Please provide a URL to audit.",
            };
            return NextResponse.json(error, { status: 400 });
        }

        console.log("Starting code-based audit pipeline for:", url);

        let pageContent = "";
        let context = "";

        // Disable SSL certificate validation for this request (Fix for self-signed/invalid certs)
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        // Fetch URL content directly
        try {
            console.log("Fetching URL content...");
            const response = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
                },
                next: { revalidate: 60 }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
            }

            pageContent = await response.text();
            console.log(`Fetched ${pageContent.length} bytes of HTML.`);

            context = `Analyzed URL: ${url}`;
        } catch (error) {
            console.error("Fetch error:", error);
            const errorResponse: AuditError = {
                code: "FETCH_ERROR",
                message: "Could not access the provided URL. using fallback analysis.",
                details: error instanceof Error ? error.message : String(error),
            };
            return NextResponse.json(errorResponse, { status: 400 });
        }

        // Step 2: Analyze with Claude (Text/Code Mode)
        console.log("Analyzing HTML content with Claude...");

        // Get Enriched Issues directly from Claude
        let enrichedIssues;
        try {
            // Pass HTML string instead of image buffer
            enrichedIssues = await analyzeUIWithClaude(pageContent, context);
            console.log(`Claude analysis complete. Found ${enrichedIssues.length} issues.`);
        } catch (error) {
            console.error("Claude analysis step failed:", error);
            throw error;
        }

        // Step 3: Merge and score (Scoring)
        console.log("Merging and scoring with Claude...");
        let auditResult;
        try {
            auditResult = await mergeAndScore(enrichedIssues);
            console.log("Claude scoring complete.");
        } catch (error) {
            console.error("Claude Scoring step failed:", error);
            throw error;
        }

        // Add analyzed URL to result
        const finalResult: AuditResult = {
            ...auditResult,
            analyzedUrl: url,
        };

        console.log("Audit complete:", {
            issueCount: finalResult.issues.length,
            score: finalResult.overallScore,
        });

        return NextResponse.json(finalResult);
    } catch (error) {
        console.error("Audit pipeline error details:", error);

        const errorResponse: AuditError = {
            code: "PIPELINE_ERROR",
            message: "An error occurred during the audit. Please try again.",
            details: error instanceof Error ? error.message : String(error),
        };

        return NextResponse.json(errorResponse, { status: 500 });
    }
}
