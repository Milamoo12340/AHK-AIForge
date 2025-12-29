
import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  version: text("version").notNull().default("v2"), // 'v1' or 'v2'
  code: text("code").notNull(),
  prompt: text("prompt").notNull(),
  isFavorite: boolean("is_favorite").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScriptSchema = createInsertSchema(scripts).omit({ 
  id: true, 
  createdAt: true 
});

export type Script = typeof scripts.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;

// Request types
export type GenerateScriptRequest = {
  prompt: string;
  version: "v1" | "v2";
  context?: string; // Optional context like "game mode" or "desktop mode"
  apiKey?: string; // Optional user-provided API key
};

export type UpdateScriptRequest = Partial<InsertScript>;
