import { CHECKPOINT_SERVICE, CheckpointService } from '$lib/server/api/checkpoints';
import { redirect } from '@sveltejs/kit';
import { Container } from '@needle-di/core';
import { auth } from '$lib/server/auth';

interface CheckpointData {
	completedSteps: string[];
	inputValues: Record<string, string>;
	resultMessages: Record<string, string>;
}

interface CheckpointMetadata {
	inputValue?: string;
	message?: string;
	slackId?: string;
	[key: string]: any;
}

export async function load({ url, request }) {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session?.user) {
		throw redirect(303, '/');
	}

	const userId = session.user.id;

	const path = url.pathname;
	const guidesMatch = path.match(/\/guides\/([^\/]+)/);
	const guideId = guidesMatch?.[1] || null;

	if (userId && guideId) {
		try {
			const checkpointService = new Container().get(CheckpointService);
			const attempts = await checkpointService.getAttemptsByUser(userId);

			const checkpointData: CheckpointData = {
				completedSteps: [],
				inputValues: {},
				resultMessages: {}
			};

			for (const attempt of attempts) {
				if (attempt.checkpoint && attempt.checkpoint_attempt) {
					const attemptGuideId = attempt.checkpoint.guideId;
					const step = attempt.checkpoint.step;

					if (attemptGuideId === guideId) {
						if (attempt.checkpoint_attempt.success) {
							checkpointData.completedSteps.push(`${attemptGuideId}:${step}`);
						}

						if (attempt.checkpoint_attempt.metadata) {
							const metadata = attempt.checkpoint_attempt.metadata as CheckpointMetadata;
							if (metadata.inputValue) {
								const key = `${attemptGuideId}:${step}`;
								checkpointData.inputValues[key] = metadata.inputValue;
							}

							if (metadata.message) {
								const key = `${attemptGuideId}:${step}`;
								checkpointData.resultMessages[key] = metadata.message;
							}
						}
					}
				}
			}

			return {
				checkpointData,
				userId
			};
		} catch (error) {
			console.error('Failed to load checkpoint data', error);
		}
	}

	return {
		checkpointData: {
			completedSteps: [],
			inputValues: {},
			resultMessages: {}
		},
		userId: userId || null
	};
}
