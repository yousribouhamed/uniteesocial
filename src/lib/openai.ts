/**
 * OpenAI Integration
 * Uses ChatGPT to generate detailed explanations and recommendations
 */

import type { RawIssue, EnrichedIssue } from "@/types/audit-types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = "gpt-4o-mini";

const EXPLANATION_PROMPT = `You are a UX/UI expert providing detailed explanations and actionable recommendations for design issues.

For each issue provided, generate:
1. A detailed description explaining WHY this is a problem and its impact on users
2. A specific, actionable recommendation on how to fix it

The input will be a JSON array of issues. Return a JSON array with the same issues but with added "description" and "recommendation" fields.

Example input:
[{"title": "Low Contrast Text", "severity": "critical", "location": "Hero section"}]

Example output:
[{
  "title": "Low Contrast Text",
  "severity": "critical",
  "location": "Hero section",
  "description": "The text contrast ratio appears to be below WCAG AA standards (4.5:1 for normal text). This makes content difficult to read for users with visual impairments, in bright environments, or on lower-quality displays.",
  "recommendation": "Increase the contrast ratio by using darker text colors (#333 or darker) or lighter backgrounds. Use a contrast checker tool to verify a minimum ratio of 4.5:1 for body text and 3:1 for large text (18px+ or 14px+ bold)."
}]

Only return the JSON array, no other text.`;

/**
 * Generate detailed explanations and recommendations for issues
 */
export async function generateExplanations(issues: RawIssue[]): Promise<EnrichedIssue[]> {
    if (!OPENAI_API_KEY) {
        console.warn("OPENAI_API_KEY not configured, using mock explanations");
        return getMockExplanations(issues);
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [
                    { role: "system", content: EXPLANATION_PROMPT },
                    { role: "user", content: JSON.stringify(issues) },
                ],
                temperature: 0.3,
                max_tokens: 2048,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("OpenAI API error:", error);
            return getMockExplanations(issues);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.error("No content in OpenAI response");
            return getMockExplanations(issues);
        }

        // Parse the JSON response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const enrichedIssues = JSON.parse(jsonMatch[0]) as EnrichedIssue[];
            return enrichedIssues.map((issue, index) => ({
                ...issue,
                id: `issue-${index + 1}`,
            }));
        }

        return getMockExplanations(issues);
    } catch (error) {
        console.error("OpenAI explanation error:", error);
        return getMockExplanations(issues);
    }
}

/**
 * Mock explanations for when OpenAI is not configured
 */
function getMockExplanations(issues: RawIssue[]): EnrichedIssue[] {
    const explanationTemplates: Record<string, { description: string; recommendation: string }> = {
        "Low Contrast Text": {
            description:
                "Text elements have contrast ratios below WCAG AA standards (4.5:1). This affects users with visual impairments and reduces readability in bright environments.",
            recommendation:
                "Increase text color darkness or background lightness. Aim for at least 4.5:1 for normal text and 3:1 for large text. Use a contrast checker tool to verify.",
        },
        "Missing Focus Indicators": {
            description:
                "Interactive elements lack visible focus indicators, making keyboard navigation difficult for users who rely on it for accessibility.",
            recommendation:
                "Add visible focus styles (outline or box-shadow) to all interactive elements. Use CSS :focus-visible for modern browsers to show focus only for keyboard users.",
        },
        "Small Touch Targets": {
            description:
                "Some interactive elements have touch targets smaller than 44x44 pixels, making them difficult to tap accurately on mobile devices.",
            recommendation:
                "Increase the minimum size of interactive elements to 44x44 pixels. Add padding if the visual design needs to remain compact.",
        },
        "Inconsistent Spacing": {
            description:
                "Spacing between elements varies inconsistently, creating visual rhythm issues that affect the overall design cohesion and hierarchy.",
            recommendation:
                "Establish a spacing scale (e.g., 4px, 8px, 16px, 24px, 32px) and apply it consistently throughout the design using CSS custom properties.",
        },
        "Missing Alt Text": {
            description:
                "Images are missing descriptive alt text, which impacts screen reader users and SEO. Users relying on assistive technology cannot understand the image content.",
            recommendation:
                'Add meaningful alt text to all images describing their content and purpose. For decorative images, use alt="" to indicate they should be skipped.',
        },
        "Color-Only Status Indicators": {
            description:
                "Status information is conveyed using color alone, which may not be perceivable by users with color vision deficiency (affects ~8% of men).",
            recommendation:
                "Add icons, patterns, or text labels alongside color to ensure information is accessible. Consider using both color and shape for status indicators.",
        },
    };

    return issues.map((issue, index) => {
        const template = explanationTemplates[issue.title] || {
            description: `This is a ${issue.severity} issue that affects user experience. ${issue.location ? `Located in: ${issue.location}` : ""}`,
            recommendation:
                "Review this element and apply UX best practices to improve usability and accessibility.",
        };

        return {
            id: `issue-${index + 1}`,
            title: issue.title,
            severity: issue.severity,
            location: issue.location,
            element: issue.element,
            description: template.description,
            recommendation: template.recommendation,
        };
    });
}
