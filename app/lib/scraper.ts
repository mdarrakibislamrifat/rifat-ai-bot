import * as cheerio from "cheerio";

// =====================
// Config
// =====================
const DELAY_MS = 300;
const CHUNK_SIZE = 1000;

const SKIP_EXTENSIONS = /\.(pdf|jpg|jpeg|png|gif|webp|zip|css|js|svg|ico|mp4|mp3)$/i;
const SKIP_PATTERNS = ["#", "mailto:", "tel:", "javascript:", "/login", "/signup", "/cart", "/checkout", "/account"];

export type ScrapeOptions = {
  maxPages?: number;       
  useSitemap?: boolean;     
  onProgress?: (info: ProgressInfo) => void;
};

export type ProgressInfo = {
  pagesScraped: number;
  totalQueued: number;
  chunksCollected: number;
  currentUrl: string;
};

// =====================
// Main Entry Point
// =====================
export async function scrapeWebsite(
  startUrl: string,
  options: ScrapeOptions = {}
): Promise<string[]> {
  const { maxPages = 50, useSitemap = true, onProgress } = options;
  const baseUrl = new URL(startUrl).origin;

  let urlsToScrape: string[] = [];

  // Step 1: Try sitemap first
  if (useSitemap) {
    console.log("[Scraper] Trying sitemap...");
    urlsToScrape = await getUrlsFromSitemap(baseUrl, maxPages);
  }

  // Step 2: Fallback to crawling if sitemap empty
  if (urlsToScrape.length === 0) {
    console.log("[Scraper] No sitemap found, falling back to crawl...");
    urlsToScrape = await crawlWebsite(startUrl, baseUrl, maxPages, onProgress);
    return urlsToScrape; // crawl already returns chunks
  }

  // Step 3: Scrape each URL from sitemap
  console.log(`[Scraper] Found ${urlsToScrape.length} URLs from sitemap`);
  const allChunks: string[] = [];

  for (let i = 0; i < urlsToScrape.length; i++) {
    const url = urlsToScrape[i];

    onProgress?.({
      pagesScraped: i + 1,
      totalQueued: urlsToScrape.length,
      chunksCollected: allChunks.length,
      currentUrl: url,
    });

    const chunks = await scrapeSinglePage(url);
    allChunks.push(...chunks);

    await delay(DELAY_MS);
  }

  console.log(`[Scraper] Done. Pages: ${urlsToScrape.length}, Chunks: ${allChunks.length}`);
  return allChunks;
}

// =====================
// Sitemap Parser
// =====================
async function getUrlsFromSitemap(baseUrl: string, limit: number): Promise<string[]> {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap/sitemap.xml`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const res = await fetch(sitemapUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RifatBot/1.0;)" },
      });

      if (!res.ok) continue;

      const xml = await res.text();
      const $ = cheerio.load(xml, { xmlMode: true });
      const urls: string[] = [];

      // Handle sitemap index (sitemap of sitemaps)
      const sitemapLocs = $("sitemap loc");
      if (sitemapLocs.length > 0) {
        // Fetch first child sitemap only (to stay within limits)
        const childSitemapUrl = sitemapLocs.first().text().trim();
        const childRes = await fetch(childSitemapUrl);
        if (childRes.ok) {
          const childXml = await childRes.text();
          const $child = cheerio.load(childXml, { xmlMode: true });
          $child("url loc").each((_, el) => {
            const url = $child(el).text().trim();
            if (url && !shouldSkipUrl(url)) urls.push(url);
          });
        }
      } else {
        // Regular sitemap
        $("url loc").each((_, el) => {
          const url = $(el).text().trim();
          if (url && !shouldSkipUrl(url)) urls.push(url);
        });
      }

      if (urls.length > 0) {
        console.log(`[Scraper] Sitemap found at ${sitemapUrl} with ${urls.length} URLs`);
        return urls.slice(0, limit);
      }
    } catch {
      continue;
    }
  }

  return [];
}

// =====================
// Crawler (fallback)
// =====================
async function crawlWebsite(
  startUrl: string,
  baseUrl: string,
  maxPages: number,
  onProgress?: (info: ProgressInfo) => void
): Promise<string[]> {
  const visited = new Set<string>();
  const queue = [startUrl];
  const allChunks: string[] = [];

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    onProgress?.({
      pagesScraped: visited.size,
      totalQueued: queue.length,
      chunksCollected: allChunks.length,
      currentUrl: url,
    });

    try {
      console.log(`[Scraper] Crawling: ${url}`);
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RifatBot/1.0;)" },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      // Collect links
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        try {
          const fullUrl = new URL(href, baseUrl).toString();
          if (
            fullUrl.startsWith(baseUrl) &&
            !visited.has(fullUrl) &&
            !shouldSkipUrl(fullUrl)
          ) {
            queue.push(fullUrl);
          }
        } catch {}
      });

      // Extract text
      const chunks = extractChunks($);
      allChunks.push(...chunks);

      await delay(DELAY_MS);
    } catch (error) {
      console.error(`[Scraper] Error crawling ${url}:`, error);
    }
  }

  console.log(`[Scraper] Crawl done. Pages: ${visited.size}, Chunks: ${allChunks.length}`);
  return allChunks;
}

// =====================
// Single Page Scraper
// =====================
async function scrapeSinglePage(url: string): Promise<string[]> {
  try {
    console.log(`[Scraper] Scraping: ${url}`);
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RifatBot/1.0;)" },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const $ = cheerio.load(html);
    return extractChunks($);
  } catch (error) {
    console.error(`[Scraper] Error on ${url}:`, error);
    return [];
  }
}

// =====================
// Text Extractor
// =====================
function extractChunks($: cheerio.CheerioAPI): string[] {
  $("script, style, footer, nav, noscript, header, iframe, [aria-hidden='true']").remove();

  const rawText = $("body").text();
  const cleanText = rawText
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .trim();

  if (cleanText.length < 100) return [];

  return chunkText(cleanText, CHUNK_SIZE);
}

// =====================
// Helpers
// =====================
function shouldSkipUrl(url: string): boolean {
  if (SKIP_EXTENSIONS.test(url)) return true;
  return SKIP_PATTERNS.some((pattern) => url.includes(pattern));
}

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}