import { pgTable, serial, text, timestamp, vector, uuid, boolean, jsonb } from "drizzle-orm/pg-core";


export const chatbots = pgTable("chatbots", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), 
  name: text("name").notNull(),
  websiteUrl: text("website_url"),
  welcomeMessage: text("welcome_message").default("Hi! How can I help you today?"),
  themeColor: text("theme_color").default("#000000"),
  displayName: text("display_name").notNull(),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

//  (Scraped Data & Embeddings)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  chatbotId: uuid("chatbot_id").references(() => chatbots.id, { onDelete: 'cascade' }),
  content: text("content").notNull(), 
  embedding: vector("embedding", { dimensions: 1536 }), 
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

//  (Analytics & User History)
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  chatbotId: uuid("chatbot_id").references(() => chatbots.id, { onDelete: 'cascade' }),
  userIdentifier: text("user_identifier"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: uuid("conversation_id").references(() => conversations.id, { onDelete: 'cascade' }),
  role: text("role").$type<"user" | "assistant">().notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});