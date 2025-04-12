import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const checkpoint = pgTable('checkpoint', {
	id: text('id').primaryKey(),
	guideId: text('guide_id').notNull(),
	step: text('step').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const checkpointAttempt = pgTable('checkpoint_attempt', {
	id: text('id').primaryKey(),
	checkpointId: text('checkpoint_id')
		.notNull()
		.references(() => checkpoint.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	success: boolean('success').notNull(),
	metadata: jsonb('metadata'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const badge = pgTable('badge', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	guideId: text('guide_id').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
