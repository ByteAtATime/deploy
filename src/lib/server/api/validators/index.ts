import { InjectionToken } from '@needle-di/core';
import type { GuideValidator } from './base';
import { VercelGuideValidator } from './vercel';

export * from './base';
export * from './vercel';

export const VALIDATORS = new InjectionToken<GuideValidator[]>('VALIDATORS', {
	factory: () => [new VercelGuideValidator()]
});
