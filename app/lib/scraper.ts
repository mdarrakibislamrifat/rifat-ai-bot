import * as cheerio from "cheerio";

export async function scrapeWebsite(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RifatBot/1.0;)",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch the website");

    const html = await response.text();
    const $ = cheerio.load(html);

    $("script, style, footer, nav, noscript, header").remove();

    const rawText = $("body").text();

    const cleanText = rawText
      .replace(/\s+/g, " ")
      .replace(/\n+/g, " ")
      .trim();

    const chunks = chunkText(cleanText, 1000); 

    return chunks;
  } catch (error) {
    console.error("Scraping error:", error);
    return [];
  }
}

function chunkText(text: string, size: number): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}