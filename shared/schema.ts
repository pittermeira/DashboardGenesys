import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  agent: text("agent").notNull(),
  customer: text("customer").notNull(),
  queue: text("queue").notNull(),
  mediaType: text("media_type").notNull(),
  direction: text("direction").notNull(),
  duration: integer("duration").notNull(), // in milliseconds
  wrapUp: text("wrap_up"),
  flow: text("flow"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  ani: text("ani"),
  dnis: text("dnis"),
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
}).extend({
  startTime: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  endTime: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Interaction = typeof interactions.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
