import { pgTable, serial, varchar, timestamp, text } from 'drizzle-orm/pg-core';

export const mvpUsers = pgTable('mvp_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  interests: text('interests').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof mvpUsers.$inferSelect;
export type NewUser = typeof mvpUsers.$inferInsert;
