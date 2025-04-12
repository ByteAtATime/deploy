import { injectable, inject } from '@needle-di/core';
import { db } from '../../db';
import { checkpoint, checkpointAttempt, badge } from '../../db/schema';
import { eq, and } from 'drizzle-orm';

function generateId() {
	return crypto.randomUUID();
}

export interface CheckpointData {
	guideId: string;
	step: string;
}

export interface AttemptData {
	userId: string;
	success: boolean;
	metadata?: Record<string, any>;
	inputValue?: string;
	message?: string;
}

@injectable()
export class CheckpointService {
	async getOrCreateCheckpoint(data: CheckpointData) {
		const existingCheckpoint = await db.query.checkpoint.findFirst({
			where: and(eq(checkpoint.guideId, data.guideId), eq(checkpoint.step, data.step))
		});

		if (existingCheckpoint) {
			return existingCheckpoint;
		}

		const newCheckpoint = {
			id: generateId(),
			guideId: data.guideId,
			step: data.step,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await db.insert(checkpoint).values(newCheckpoint);
		return newCheckpoint;
	}

	async recordAttempt(checkpointData: CheckpointData, attemptData: AttemptData) {
		const checkpointRecord = await this.getOrCreateCheckpoint(checkpointData);

		const metadata = attemptData.metadata || {};
		if (attemptData.inputValue) {
			metadata.inputValue = attemptData.inputValue;
		}
		if (attemptData.message) {
			metadata.message = attemptData.message;
		}

		const attempt = {
			id: generateId(),
			checkpointId: checkpointRecord.id,
			userId: attemptData.userId,
			success: attemptData.success,
			metadata: Object.keys(metadata).length > 0 ? metadata : null,
			createdAt: new Date()
		};

		await db.insert(checkpointAttempt).values(attempt);
		return attempt;
	}

	async getAttemptsByUser(userId: string) {
		return db
			.select()
			.from(checkpointAttempt)
			.where(eq(checkpointAttempt.userId, userId))
			.innerJoin(checkpoint, eq(checkpointAttempt.checkpointId, checkpoint.id));
	}

	async getInputValue(guideId: string, step: string, userId: string) {
		const attempts = await db
			.select()
			.from(checkpointAttempt)
			.innerJoin(checkpoint, eq(checkpointAttempt.checkpointId, checkpoint.id))
			.where(
				and(
					eq(checkpointAttempt.userId, userId),
					eq(checkpoint.guideId, guideId),
					eq(checkpoint.step, step)
				)
			)
			.orderBy(checkpointAttempt.createdAt);

		for (const attempt of attempts) {
			const metadata = attempt.checkpoint_attempt.metadata as { inputValue?: string };
			if (metadata?.inputValue) {
				return metadata.inputValue;
			}
		}
		return null;
	}

	async getResultMessage(guideId: string, step: string, userId: string) {
		const attempts = await db
			.select()
			.from(checkpointAttempt)
			.innerJoin(checkpoint, eq(checkpointAttempt.checkpointId, checkpoint.id))
			.where(
				and(
					eq(checkpointAttempt.userId, userId),
					eq(checkpoint.guideId, guideId),
					eq(checkpoint.step, step)
				)
			)
			.orderBy(checkpointAttempt.createdAt);

		for (const attempt of attempts.reverse()) {
			const metadata = attempt.checkpoint_attempt.metadata as { message?: string };
			if (metadata?.message) {
				return metadata.message;
			}
		}
		return null;
	}

	async isGuideCompleted(guideId: string, userId: string): Promise<boolean> {
		const attempts = await db
			.select()
			.from(checkpointAttempt)
			.innerJoin(checkpoint, eq(checkpointAttempt.checkpointId, checkpoint.id))
			.where(
				and(
					eq(checkpointAttempt.userId, userId),
					eq(checkpoint.guideId, guideId),
					eq(checkpointAttempt.success, true)
				)
			);

		if (attempts.length === 0) return false;

		const stepsCompleted = new Set<string>();

		for (const attempt of attempts) {
			stepsCompleted.add(attempt.checkpoint.step);
		}

		const allSteps = await db.select().from(checkpoint).where(eq(checkpoint.guideId, guideId));

		const totalUniqueSteps = new Set(allSteps.map((step) => step.step)).size;

		return stepsCompleted.size === totalUniqueSteps;
	}

	async awardBadge(guideId: string, userId: string): Promise<boolean> {
		const existingBadge = await db
			.select()
			.from(badge)
			.where(and(eq(badge.userId, userId), eq(badge.guideId, guideId)))
			.limit(1);

		if (existingBadge.length > 0) {
			return false;
		}

		const newBadge = {
			id: generateId(),
			userId,
			guideId,
			createdAt: new Date()
		};

		await db.insert(badge).values(newBadge);
		return true;
	}

	async checkAndAwardBadge(guideId: string, userId: string): Promise<boolean> {
		const isCompleted = await this.isGuideCompleted(guideId, userId);

		if (isCompleted) {
			return this.awardBadge(guideId, userId);
		}

		return false;
	}

	async getUserBadges(userId: string) {
		return db.select().from(badge).where(eq(badge.userId, userId));
	}
}
