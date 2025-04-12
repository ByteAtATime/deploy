import { Container, inject, injectable } from '@needle-di/core';
import { Hono } from 'hono';
import { auth } from '../auth';
import { VALIDATORS } from './validators';
import { CHECKPOINT_SERVICE, CheckpointService } from './checkpoints';

@injectable()
export class Api {
	private app: Hono;

	constructor(
		private validators = inject(VALIDATORS),
		private checkpointService = inject(CHECKPOINT_SERVICE)
	) {
		this.app = new Hono();
	}

	public routes() {
		return this.app
			.get('/', (c) => c.text('Hello World'))
			.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))
			.post('/api/guides/:guideId/validate/:step', async (c) => {
				try {
					const guideId = c.req.param('guideId');
					const step = c.req.param('step');
					const body = await c.req.json();

					const validator = this.validators.find((v) => v.guideId === guideId);

					if (!validator) {
						return c.json({ success: false, message: 'Invalid guide' }, 400);
					}

					if (!validator.canValidate(step)) {
						return c.json({ success: false, message: 'Invalid validation step' }, 400);
					}

					const result = await validator.validate(step, body);

					const session = await auth.api.getSession({
						headers: c.req.raw.headers
					});

					const userId = session?.user?.id;

					if (!userId) {
						return c.json({ success: false, message: 'Unauthorized' }, 401);
					}

					await this.checkpointService.recordAttempt(
						{ guideId, step },
						{
							userId,
							success: result.success,
							metadata: body.slackId ? { slackId: body.slackId } : undefined,
							inputValue: body.url,
							message: result.message
						}
					);

					if (result.success) {
						await this.checkpointService.checkAndAwardBadge(guideId, userId);
					}

					return c.json(result);
				} catch (error) {
					return c.json({ success: false, message: 'Invalid request' }, 400);
				}
			})
			.get('/api/checkpoints', async (c) => {
				try {
					const session = await auth.api.getSession({
						headers: c.req.raw.headers
					});
					const userId = session?.user?.id;

					if (!userId) {
						return c.json({ success: false, message: 'Unauthorized' }, 401);
					}

					const attempts = await this.checkpointService.getAttemptsByUser(userId);
					return c.json({ attempts });
				} catch (error) {
					return c.json({ success: false, message: 'Error retrieving checkpoints' }, 500);
				}
			})
			.get('/api/guides/:guideId/result/:step', async (c) => {
				try {
					const guideId = c.req.param('guideId');
					const step = c.req.param('step');

					const session = await auth.api.getSession({
						headers: c.req.raw.headers
					});
					const userId = session?.user?.id;

					if (!userId) {
						return c.json({ success: false, message: 'Unauthorized' }, 401);
					}

					const message = await this.checkpointService.getResultMessage(guideId, step, userId);
					return c.json({ success: true, message });
				} catch (error) {
					return c.json({ success: false, message: 'Error retrieving result message' }, 500);
				}
			})
			.get('/api/badges', async (c) => {
				try {
					const session = await auth.api.getSession({
						headers: c.req.raw.headers
					});
					const userId = session?.user?.id;

					if (!userId) {
						return c.json({ success: false, message: 'Unauthorized' }, 401);
					}

					const userBadges = await this.checkpointService.getUserBadges(userId);
					return c.json({ success: true, badges: userBadges });
				} catch (error) {
					return c.json({ success: false, message: 'Error retrieving badges' }, 500);
				}
			});
	}
}

export const routes = new Container().get(Api).routes();
