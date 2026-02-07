/**
 * Figma API Integration
 * Extracts node data and exports images from Figma designs
 */

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_API_BASE = "https://api.figma.com/v1";

export interface FigmaNodeData {
    fileKey: string;
    nodeId: string;
    name: string;
    type: string;
    image?: Buffer;
    imageUrl?: string;
    metadata: {
        width?: number;
        height?: number;
        colors?: string[];
        fonts?: string[];
        textContent?: string[];
        componentNames?: string[];
    };
    error?: string;
}

interface ParsedFigmaUrl {
    fileKey: string;
    nodeId?: string;
}

/**
 * Parse Figma URL to extract fileKey and nodeId
 * Supports formats:
 * - https://figma.com/file/FILE_KEY/Name
 * - https://figma.com/design/FILE_KEY/Name?node-id=X-Y
 * - https://www.figma.com/file/FILE_KEY/Name?node-id=X:Y
 */
export function parseFigmaUrl(url: string): ParsedFigmaUrl | null {
    try {
        const urlObj = new URL(url);

        // Match /file/ or /design/ paths
        const pathMatch = urlObj.pathname.match(/\/(file|design)\/([a-zA-Z0-9]+)/);
        if (!pathMatch) return null;

        const fileKey = pathMatch[2];

        // Extract node-id from query params
        const nodeIdParam = urlObj.searchParams.get("node-id");
        let nodeId: string | undefined;

        if (nodeIdParam) {
            // Convert X-Y to X:Y format (Figma API uses colons)
            nodeId = nodeIdParam.replace(/-/g, ":");
        }

        return { fileKey, nodeId };
    } catch {
        return null;
    }
}

/**
 * Fetch Figma node data and export image
 */
export async function fetchFigmaNode(figmaUrl: string): Promise<FigmaNodeData> {
    const parsed = parseFigmaUrl(figmaUrl);

    if (!parsed) {
        return {
            fileKey: "",
            nodeId: "",
            name: "Unknown",
            type: "UNKNOWN",
            metadata: {},
            error: "Invalid Figma URL format",
        };
    }

    if (!FIGMA_ACCESS_TOKEN) {
        console.warn("FIGMA_ACCESS_TOKEN not configured, using mock data");
        return getMockFigmaData(parsed.fileKey, parsed.nodeId);
    }

    try {
        const headers = {
            "X-Figma-Token": FIGMA_ACCESS_TOKEN,
        };

        // Fetch node data
        let nodeData: any;
        let nodeName = "Design";
        let nodeType = "FRAME";

        if (parsed.nodeId) {
            const nodeResponse = await fetch(
                `${FIGMA_API_BASE}/files/${parsed.fileKey}/nodes?ids=${encodeURIComponent(parsed.nodeId)}`,
                { headers }
            );

            if (!nodeResponse.ok) {
                throw new Error(`Figma API error: ${nodeResponse.statusText}`);
            }

            const data = await nodeResponse.json();
            nodeData = data.nodes?.[parsed.nodeId]?.document;
            nodeName = nodeData?.name || "Design";
            nodeType = nodeData?.type || "FRAME";
        } else {
            // Fetch file metadata if no specific node
            const fileResponse = await fetch(
                `${FIGMA_API_BASE}/files/${parsed.fileKey}?depth=1`,
                { headers }
            );

            if (!fileResponse.ok) {
                throw new Error(`Figma API error: ${fileResponse.statusText}`);
            }

            const data = await fileResponse.json();
            nodeName = data.name || "Design";
            nodeType = "FILE";
        }

        // Export as image
        const imageNodeId = parsed.nodeId || "0:1"; // Default to first page
        const imageResponse = await fetch(
            `${FIGMA_API_BASE}/images/${parsed.fileKey}?ids=${encodeURIComponent(imageNodeId)}&format=png&scale=2`,
            { headers }
        );

        let imageBuffer: Buffer | undefined;
        let imageUrl: string | undefined;

        if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            imageUrl = imageData.images?.[imageNodeId];

            if (imageUrl) {
                const imgFetch = await fetch(imageUrl);
                if (imgFetch.ok) {
                    imageBuffer = Buffer.from(await imgFetch.arrayBuffer());
                }
            }
        }

        // Extract metadata from node
        const metadata = extractMetadata(nodeData);

        return {
            fileKey: parsed.fileKey,
            nodeId: parsed.nodeId || "",
            name: nodeName,
            type: nodeType,
            image: imageBuffer,
            imageUrl,
            metadata,
        };
    } catch (error) {
        console.error("Figma fetch error:", error);
        return getMockFigmaData(parsed.fileKey, parsed.nodeId);
    }
}

/**
 * Extract useful metadata from Figma node
 */
function extractMetadata(node: any): FigmaNodeData["metadata"] {
    if (!node) return {};

    const colors: string[] = [];
    const fonts: string[] = [];
    const textContent: string[] = [];
    const componentNames: string[] = [];

    function traverse(n: any) {
        if (!n) return;

        // Extract text content
        if (n.type === "TEXT" && n.characters) {
            textContent.push(n.characters);
        }

        // Extract fonts
        if (n.style?.fontFamily && !fonts.includes(n.style.fontFamily)) {
            fonts.push(n.style.fontFamily);
        }

        // Extract colors from fills
        if (n.fills && Array.isArray(n.fills)) {
            for (const fill of n.fills) {
                if (fill.type === "SOLID" && fill.color) {
                    const hex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
                    if (!colors.includes(hex)) colors.push(hex);
                }
            }
        }

        // Track component names
        if (n.type === "COMPONENT" || n.type === "INSTANCE") {
            componentNames.push(n.name);
        }

        // Recurse children
        if (n.children) {
            for (const child of n.children) {
                traverse(child);
            }
        }
    }

    traverse(node);

    return {
        width: node?.absoluteBoundingBox?.width,
        height: node?.absoluteBoundingBox?.height,
        colors: colors.slice(0, 10),
        fonts: fonts.slice(0, 5),
        textContent: textContent.slice(0, 20),
        componentNames: componentNames.slice(0, 10),
    };
}

function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Mock data when Figma API not configured
 */
function getMockFigmaData(fileKey: string, nodeId?: string): FigmaNodeData {
    return {
        fileKey,
        nodeId: nodeId || "",
        name: "Mock Design Frame",
        type: "FRAME",
        metadata: {
            width: 1440,
            height: 900,
            colors: ["#1a1a2e", "#16213e", "#0f3460", "#e94560", "#ffffff"],
            fonts: ["Inter", "Roboto"],
            textContent: ["Welcome", "Get Started", "Learn More"],
            componentNames: ["Button", "Card", "Header"],
        },
        error: "FIGMA_ACCESS_TOKEN not configured - using mock data",
    };
}
