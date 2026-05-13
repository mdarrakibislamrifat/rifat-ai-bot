import { db } from "@/app/db";
import { documents } from "@/app/db/schema";
import { generateEmbeddings } from "@/app/lib/gemini";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, chatbotId } = await req.json();

    const userMessageEmbedding = await generateEmbeddings(message);

    const vectorString = `[${userMessageEmbedding.join(",")}]`;

      const relevantDocs = await db.execute<{ content: string }>(sql`
        SELECT content FROM documents
        WHERE chatbot_id = ${chatbotId}
        ORDER BY embedding <=> ${vectorString}::vector
        LIMIT 5
      `);

    const context =
      relevantDocs.rows.length > 0
        ? relevantDocs.rows.map((doc) => doc.content).join("\n\n")
        : "No relevant context found.";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
  You are an expert sales assistant for this website. 
  
  CONTEXT:
  ${context}

  USER QUESTION: ${message}

  INSTRUCTIONS:
  1. If the user asks about available products, list the product names found in the context.
  2. Even if the information is partial, provide what is available (e.g., product categories, brands).
  3. Answer in the same language as the user.
  4. If NO product names are found in the context, then only mention price filters or categories.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ text: response });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch response" },
      { status: 500 },
    );
  }
}
