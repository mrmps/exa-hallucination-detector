import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  sentences: text('sentences').array().notNull(),
  claims: jsonb('claims').default('[]'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;