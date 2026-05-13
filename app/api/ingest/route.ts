import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/app/lib/scraper";
import { generateEmbeddings } from "@/app/lib/gemini";
import { documents } from "@/app/db/schema";
import { db } from "@/app/db";

export async function POST(req: Request) {
  try {
    const { url, chatbotId, maxPages = 50 } = await req.json();

    if (!url || !chatbotId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    console.log(`[Ingest] Starting for ${url}, maxPages: ${maxPages}`);

    const chunks = await scrapeWebsite(url, {
      maxPages,
      useSitemap: true,
      onProgress: (info) => {
        console.log(
          `[Ingest] Progress: ${info.pagesScraped}/${info.totalQueued} pages | ${info.chunksCollected} chunks | ${info.currentUrl}`
        );
      },
    });

    if (chunks.length === 0) {
      return NextResponse.json({ error: "No content found on the website" }, { status: 400 });
    }

    console.log(`[Ingest] Scraped ${chunks.length} chunks. Generating embeddings...`);

    let successCount = 0;
    let errorCount = 0;

    for (const chunk of chunks) {
      try {
        const embedding = await generateEmbeddings(chunk);

        await db.insert(documents).values({
          chatbotId,
          content: chunk,
          embedding,
          metadata: { source: url },
        });

        successCount++;
      } catch (err) {
        console.error(`[Ingest] Failed for chunk:`, err);
        errorCount++;
      }

      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`[Ingest] Done. Success: ${successCount}, Errors: ${errorCount}`);

    return NextResponse.json({
      message: "Ingestion successful",
      stats: {
        totalChunks: chunks.length,
        successCount,
        errorCount,
      },
    });
  } catch (error: any) {
    console.error("[Ingest] Fatal Error:", error);
    return NextResponse.json(
      { error: "Failed to process data", detail: error.message },
      { status: 500 }
    );
  }
}