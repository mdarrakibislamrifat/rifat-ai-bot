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

    const relevantDocs = await db.execute<{ content: string }>(sql`
      SELECT content FROM documents 
      WHERE chatbot_id = ${chatbotId} 
      ORDER BY embedding <=> ${JSON.stringify(userMessageEmbedding)}::vector 
      LIMIT 5
    `);

    const context = relevantDocs.rows.length > 0 
      ? relevantDocs.rows.map((doc) => doc.content).join("\n\n") 
      : "No relevant context found.";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are a helpful AI assistant for a website. 
      Use the following context to answer the user's question. 
      If the answer is not in the context, say you don't know, don't make up things.
      
      Context: ${context}
      
      User Question: ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ text: response });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}