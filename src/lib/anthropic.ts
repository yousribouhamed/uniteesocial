/**
 * Anthropic (Claude) Integration
 * Uses Claude to merge, deduplicate, normalize, and score audit results
 */

import type { EnrichedIssue, AuditResult } from "@/types/audit-types";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_MODEL = "claude-3-sonnet-20240229";

const MERGE_SCORE_PROMPT = `You are a UX audit system that finalizes and scores UX analysis results.

Your tasks:
1. Remove any duplicate or very similar issues
2. Ensure severity levels are appropriate (critical = blocks users, warning = hurts usability, info = minor)
3. Calculate an overall UX score from 0-100 based on the issues:
   - Start at 100
   - Subtract 15 for each critical issue
   - Subtract 8 for each warning
   - Subtract 3 for each info
   - Minimum score is 0
4. Generate a brief 1-2 sentence summary of the overall UX health

Return a JSON object with this structure:
{
  "issues": [...deduplicated and normalized issues...],
  "overallScore": 72,
  "summary": "The UI has good foundations but needs accessibility improvements, particularly around contrast and focus states."
}

Only return the JSON object, no other text.`;

/**
 * Analyze a UI based on code/text structure (HTML/Text) or Image
 */
export async function analyzeUIWithClaude(input: Buffer | string, context?: string): Promise<EnrichedIssue[]> {
    if (!ANTHROPIC_API_KEY) {
        console.warn("ANTHROPIC_API_KEY not configured, using mock analysis");
        return [];
    }

    try {
        const isImage = Buffer.isBuffer(input);
        const mediaType = "image/png";

        // Construct prompt based on input type
        let systemPrompt = `You are a senior UX/UI expert and Code Auditor. `;
        if (isImage) {
            systemPrompt += `Analyze this UI screenshot to identify usability and accessibility issues.`;
        } else {
            systemPrompt += `Analyze this HTML/Page content to identify usability, accessibility, and structural issues. Use the provided HTML structure, metadata, and text content to infer the user experience.`;
        }

        const userContent: any[] = [];

        if (isImage) {
            userContent.push({
                type: "image",
                source: {
                    type: "base64",
                    media_type: mediaType,
                    data: input.toString("base64"),
                },
            });
        } else {
            // Text/Code Input
            // Truncate if too large to avoid token limits (approx 100k chars safe for 200k context)
            const textContent = (input as string).slice(0, 50000);
            userContent.push({
                type: "text",
                text: `Analyze this Page Content:\n\n${textContent}`
            });
        }

        const promptText = `For each issue found, provide:
1. A clear, concise title
2. Severity level: "critical" (blocks users), "warning" (hurts usability), or "info" (minor improvement)
3. The location or element affected
4. A detailed description explaining WHY this is a problem and its impact on users
5. A specific, actionable recommendation on how to fix it

Focus on:
- Semantic HTML usage and Accessibility (ARIA, alt text, structure)
- SEO best practices (structure, metadata)
- Usability concerns evident in text/content hierarchy
- Navigation structure and link health
- Mobile responsiveness implications based on structure

${context ? `Additional Context: ${context}` : ""}

Return your analysis as a JSON array of objects with these keys:
title, severity, location, element, description, recommendation

Only return the JSON array, no other text.`;

        userContent.push({ type: "text", text: promptText });

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 4096,
                messages: [
                    {
                        role: "user",
                        content: userContent,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Claude API error:", error);
            return [getSystemErrorIssue(`Claude API Error: ${response.status} ${response.statusText}`)];
        }

        const data = await response.json();
        const content = data.content?.[0]?.text;

        if (!content) {
            console.error("No content in Claude response");
            return [getSystemErrorIssue("Received empty response from Claude API")];
        }

        console.log("Claude Raw Response:", content.slice(0, 500)); // Log first 500 chars

        // Parse the JSON response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            try {
                const issues = JSON.parse(jsonMatch[0]) as EnrichedIssue[];
                if (issues.length === 0) {
                    return [getSystemErrorIssue("Claude returned valid JSON but 0 issues. This might be correct, or a prompt issue.")];
                }
                return issues.map((issue, index) => ({
                    ...issue,
                    id: `issue-${index + 1}`,
                    location: issue.location || "General",
                    element: issue.element || "Unknown",
                }));
            } catch (e) {
                console.error("JSON parse error:", e);
                return [getSystemErrorIssue("Failed to parse Claude JSON response")];
            }
        }

        console.warn("No JSON array found in response");
        return [getSystemErrorIssue("Claude response did not contain valid JSON array")];

    } catch (error) {
        console.error("Claude analysis error:", error);
        return [getSystemErrorIssue(`Analysis failed: ${error instanceof Error ? error.message : String(error)}`)];
    }
}

function getSystemErrorIssue(details: string): EnrichedIssue {
    return {
        title: "Analysis System Error",
        severity: "critical",
        location: "System",
        element: "API",
        description: `The analysis failed to produce results. Details: ${details}`,
        recommendation: "Check server logs/console for more information.",
        id: "sys-err"
    };
}

function getMockIssues(): EnrichedIssue[] {
    return [
        {
            title: "Analysis Failed - Using Mock Data",
            severity: "warning",
            location: "System",
            element: "API",
            description: "The AI analysis service is currently unavailable or rate limited. Please check your API keys and quotas.",
            recommendation: "Verify your ANTHROPIC_API_KEY in .env.local and ensure you have credits available.",
            id: "mock-1"
        },
        {
            title: "Low Contrast Text (Mock)",
            severity: "critical",
            location: "General",
            element: "Body text",
            description: "Text contrast is below WCAG AA standards, making it hard to read.",
            recommendation: "Increase contrast ratio to at least 4.5:1.",
            id: "mock-2"
        },
        {
            title: "Missing Alt Text (Mock)",
            severity: "warning",
            location: "Images",
            element: "img",
            description: "Images missing alt text for screen readers.",
            recommendation: "Add descriptive alt text to all images.",
            id: "mock-3"
        }
    ];
}

/**
 * Merge, deduplicate, and score the audit results
 */
export async function mergeAndScore(issues: EnrichedIssue[]): Promise<AuditResult> {
    if (!ANTHROPIC_API_KEY) {
        console.warn("ANTHROPIC_API_KEY not configured, using local scoring");
        return localMergeAndScore(issues);
    }

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 2048,
                messages: [
                    {
                        role: "user",
                        content: `${MERGE_SCORE_PROMPT}\n\nIssues to process:\n${JSON.stringify(issues, null, 2)}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Anthropic API error:", error);
            return localMergeAndScore(issues);
        }

        const data = await response.json();
        const content = data.content?.[0]?.text;

        if (!content) {
            console.error("No content in Anthropic response");
            return localMergeAndScore(issues);
        }

        // Parse the JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return {
                issues: result.issues,
                overallScore: Math.max(0, Math.min(100, result.overallScore)),
                summary: result.summary,
                timestamp: new Date().toISOString(),
            };
        }

        return localMergeAndScore(issues);
    } catch (error) {
        console.error("Anthropic merge error:", error);
        return localMergeAndScore(issues);
    }
}

/**
 * Local fallback for merging and scoring when Claude is not available
 */
function localMergeAndScore(issues: EnrichedIssue[]): AuditResult {
    // Simple deduplication by title similarity
    const seen = new Set<string>();
    const deduplicated = issues.filter((issue) => {
        const normalizedTitle = issue.title.toLowerCase().replace(/\s+/g, " ");
        if (seen.has(normalizedTitle)) {
            return false;
        }
        seen.add(normalizedTitle);
        return true;
    });

    // Calculate score
    let score = 100;
    for (const issue of deduplicated) {
        if (issue.severity === "critical") score -= 15;
        else if (issue.severity === "warning") score -= 8;
        else score -= 3;
    }
    score = Math.max(0, Math.min(100, score));

    // Generate summary
    const criticalCount = deduplicated.filter((i) => i.severity === "critical").length;
    const warningCount = deduplicated.filter((i) => i.severity === "warning").length;

    let summary: string;
    if (score >= 80) {
        summary = "The UI demonstrates good UX practices with minor areas for improvement.";
    } else if (score >= 50) {
        summary = `The UI needs attention on ${criticalCount > 0 ? "critical accessibility issues" : "usability concerns"} to meet industry standards.`;
    } else {
        summary = `Significant UX improvements required. Found ${criticalCount} critical and ${warningCount} warning-level issues affecting usability.`;
    }

    return {
        issues: deduplicated,
        overallScore: score,
        summary,
        timestamp: new Date().toISOString(),
    };
}
