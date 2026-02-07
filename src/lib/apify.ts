/**
 * Apify Web Scraper Integration
 * Captures screenshots AND extracts HTML from URLs for comprehensive UX audits
 */

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const WEB_SCRAPER_ACTOR = "apify~web-scraper";

export interface ApifyScrapedData {
    screenshot?: Buffer;
    screenshotUrl?: string;
    html?: string;
    text?: string;
    title?: string;
    metadata?: {
        description?: string;
        viewport?: string;
        headings?: string[];
        links?: number;
        images?: number;
        forms?: number;
    };
    error?: string;
}

/**
 * Scrape a URL: captures screenshot and extracts HTML/text
 */
export async function scrapeUrl(url: string): Promise<ApifyScrapedData> {
    if (!APIFY_API_TOKEN) {
        console.warn("APIFY_API_TOKEN not configured, using fallback");
        return getFallbackData(url);
    }

    try {
        console.log(`Starting Apify Web Scraper for: ${url}`);

        // Start the actor run
        const runResponse = await fetch(
            `https://api.apify.com/v2/acts/${WEB_SCRAPER_ACTOR}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startUrls: [{ url }],
                    maxCrawlDepth: 0,
                    maxCrawlPages: 1,
                    pageFunction: `
            async function pageFunction(context) {
              const { page, request } = context;
              
              // Wait for page to fully load
              await page.waitForTimeout(2000);
              
              // Get page content
              const title = await page.title();
              const html = await page.content();
              const text = await page.evaluate(() => document.body.innerText);
              
              // Get metadata
              const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');
              const viewport = await page.$eval('meta[name="viewport"]', el => el.content).catch(() => '');
              
              // Count elements for audit
              const headings = await page.$$eval('h1, h2, h3', els => els.map(e => e.innerText.trim()).slice(0, 10));
              const links = await page.$$eval('a', els => els.length);
              const images = await page.$$eval('img', els => els.length);
              const forms = await page.$$eval('form', els => els.length);
              const imagesWithoutAlt = await page.$$eval('img:not([alt])', els => els.length);
              const buttonsWithoutText = await page.$$eval('button:empty', els => els.length);
              
              // Take screenshot
              const screenshot = await page.screenshot({ fullPage: false, type: 'png' });
              
              return {
                url: request.url,
                title,
                html: html.slice(0, 50000), // Limit HTML size
                text: text.slice(0, 10000), // Limit text size
                description,
                viewport,
                headings,
                links,
                images,
                forms,
                imagesWithoutAlt,
                buttonsWithoutText,
                screenshotBase64: screenshot.toString('base64'),
              };
            }
          `,
                    proxyConfiguration: { useApifyProxy: true },
                }),
            }
        );

        if (!runResponse.ok) {
            const errorText = await runResponse.text();
            console.error("Apify run failed:", errorText);
            return getFallbackData(url);
        }

        const items = await runResponse.json();

        if (!items || items.length === 0) {
            console.warn("No data returned from Apify");
            return getFallbackData(url);
        }

        const item = items[0];

        // Convert base64 screenshot to Buffer
        let screenshot: Buffer | undefined;
        if (item.screenshotBase64) {
            screenshot = Buffer.from(item.screenshotBase64, "base64");
        }

        console.log("Apify scrape complete:", {
            title: item.title,
            htmlLength: item.html?.length,
            images: item.images,
            imagesWithoutAlt: item.imagesWithoutAlt,
        });

        return {
            screenshot,
            html: item.html,
            text: item.text,
            title: item.title,
            metadata: {
                description: item.description,
                viewport: item.viewport,
                headings: item.headings,
                links: item.links,
                images: item.images,
                forms: item.forms,
            },
        };
    } catch (error) {
        console.error("Apify scrape error:", error);
        return getFallbackData(url);
    }
}

/**
 * Fallback when Apify is not available
 */
function getFallbackData(url: string): ApifyScrapedData {
    return {
        title: `Page at ${url}`,
        text: "Unable to scrape page content",
        metadata: {
            headings: [],
            links: 0,
            images: 0,
            forms: 0,
        },
        error: "APIFY_API_TOKEN not configured or scrape failed",
    };
}

/**
 * Process an uploaded image file to Buffer
 */
export async function processUploadedImage(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// Re-export for backward compatibility
export { scrapeUrl as captureScreenshot };
