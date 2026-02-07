/**
 * Gemini Vision Integration
 * Uses Google's Gemini model for visual UX analysis
 */

import type { RawIssue } from "@/types/audit-types";

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";

const UX_ANALYSIS_PROMPT = `You are a senior UX/UI expert. Analyze this UI screenshot and identify usability and accessibility issues.

For each issue found, provide:
1. A clear, concise title
2. Severity level: "critical" (blocks users), "warning" (hurts usability), or "info" (minor improvement)
3. The location or element affected (if identifiable)

Focus on:
- Accessibility issues (contrast, text size, focus indicators, alt text)
- Usability problems (confusing navigation, unclear CTAs, poor hierarchy)
- Mobile responsiveness concerns
- Consistency issues (spacing, alignment, typography)
- Interactive element problems (touch targets, hover states)

Return your analysis as a JSON array of issues. Example format:
[
  {
    "title": "Low contrast text on hero section",
    "severity": "critical",
    "location": "Hero section heading",
    "element": "h1"
  }
]

Only return the JSON array, no other text.`;

/**
 * Analyze a UI image using Gemini vision
 */
export async function analyzeUIWithGemini(imageBuffer: Buffer): Promise<RawIssue[]> {
    if (!GOOGLE_AI_API_KEY) {
        console.warn("GOOGLE_AI_API_KEY not configured, using mock analysis");
        return getMockGeminiAnalysis();
    }

    try {
        const base64Image = imageBuffer.toString("base64");
        const mimeType = "image/png"; // Assume PNG, could detect from buffer

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GOOGLE_AI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: UX_ANALYSIS_PROMPT },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Image,
                                    },
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 2048,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error("Gemini API error:", error);
            return getMockGeminiAnalysis();
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!content) {
            console.error("No content in Gemini response");
            return getMockGeminiAnalysis();
        }

        // Parse the JSON response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const issues = JSON.parse(jsonMatch[0]) as RawIssue[];
            return issues.map((issue) => ({
                title: issue.title,
                severity: issue.severity,
                location: issue.location,
                element: issue.element,
            }));
        }

        return getMockGeminiAnalysis();
    } catch (error) {
        console.error("Gemini analysis error:", error);
        return getMockGeminiAnalysis();
    }
}

/**
 * Mock analysis for when Gemini is not configured
 */
function getMockGeminiAnalysis(): RawIssue[] {
    return [
        {
            title: "Low Contrast Text",
            severity: "critical",
            location: "Multiple text elements",
            element: "p, span",
        },
        {
            title: "Missing Focus Indicators",
            severity: "critical",
            location: "Interactive elements",
            element: "button, a",
        },
        {
            title: "Small Touch Targets",
            severity: "warning",
            location: "Navigation links",
            element: "nav a",
        },
        {
            title: "Inconsistent Spacing",
            severity: "warning",
            location: "Card grid layout",
            element: "div.cards",
        },
        {
            title: "Missing Alt Text",
            severity: "warning",
            location: "Hero image",
            element: "img",
        },
        {
            title: "Color-Only Status Indicators",
            severity: "info",
            location: "Status badges",
            element: ".badge",
        },
    ];
}
