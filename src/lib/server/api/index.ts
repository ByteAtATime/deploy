import { Container, inject, injectable } from '@needle-di/core';
import { Hono } from 'hono';
import { auth } from '../auth';
import { VALIDATORS } from './validators';

@injectable()
export class Api {
	private app: Hono;

	constructor(private validators = inject(VALIDATORS)) {
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

					return c.json(await validator.validate(step, body));
				} catch (error) {
					return c.json({ success: false, message: 'Invalid request' }, 400);
				}
			});
	}
}

export const routes = new Container().get(Api).routes();
