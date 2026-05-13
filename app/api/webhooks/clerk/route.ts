import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: No svix headers", { status: 400 });
  }

  // IMPORTANT: Get the raw body as text for verification
  const payload = await req.text(); 
  
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    const email = email_addresses[0].email_address;

    try {
      await db
        .insert(users)
        .values({
          id: id,
          email: email,
          firstName: first_name,
          lastName: last_name,
          imageUrl: image_url,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email,
            firstName: first_name,
            lastName: last_name,
            imageUrl: image_url,
          },
        });
      console.log(`User ${id} synchronized with DB`);
    } catch (dbError) {
      console.error("Database Error:", dbError);
      return new Response("Error: Database insertion failed", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) await db.delete(users).where(eq(users.id, id));
  }

  return new Response("Webhook processed successfully", { status: 200 });
}