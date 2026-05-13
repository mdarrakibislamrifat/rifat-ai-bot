import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/app/lib/scraper";
import { generateEmbeddings } from "@/app/lib/gemini";
import { documents } from "@/app/db/schema";
import { db } from "@/app/db";

export async function POST(req: Request) {
  try {
    const { url, chatbotId } = await req.json();

    if (!url || !chatbotId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const chunks = await scrapeWebsite(url);

    for (const chunk of chunks) {
      const embedding = await generateEmbeddings(chunk);

      await db.insert(documents).values({
        chatbotId: chatbotId,
        content: chunk,
        embedding: embedding,
        metadata: { source: url },
      });
    }

    return NextResponse.json({ message: "Inngestion successful" });
  } catch (error) {
    console.error("Ingest Error:", error);
    return NextResponse.json({ error: "Failed to process data" }, { status: 500 });
  }
}