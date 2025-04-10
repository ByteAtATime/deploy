import { Container, injectable } from '@needle-di/core';
import { Hono } from 'hono';
import { auth } from '../auth';

@injectable()
export class Api {
	private app: Hono;

	constructor() {
		this.app = new Hono();
	}

	public routes() {
		return this.app
			.get('/', (c) => c.text('Hello World'))
			.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));
	}
}

export const routes = new Container().get(Api).routes();
