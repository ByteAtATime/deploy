import { injectable, inject, InjectionToken } from '@needle-di/core';
import { CheckpointService } from './service';

export * from './service';

export const CHECKPOINT_SERVICE = new InjectionToken<CheckpointService>('CHECKPOINT_SERVICE', {
	factory: () => new CheckpointService()
});
