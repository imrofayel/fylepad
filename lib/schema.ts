import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default("Untitled"),
  content: text("content").notNull().default(""),
  color: text("color").notNull().default("Default"),
  lock: integer("lock", { mode: "boolean" }).notNull().default(false),
  isOpen: integer("isOpen", { mode: "boolean" }).notNull().default(true),
  userId: text("userId").notNull(), // This will be Clerk's user ID
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
