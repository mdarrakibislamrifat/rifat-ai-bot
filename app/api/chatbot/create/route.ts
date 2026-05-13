import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db";
import { chatbots } from "@/app/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, url, displayName } = await req.json();

    const [newBot] = await db.insert(chatbots).values({
      userId,
      name,
      websiteUrl: url,
      displayName: displayName || name,
      isActive: true,
    }).returning({ id: chatbots.id });

    return NextResponse.json({ chatbotId: newBot.id });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}