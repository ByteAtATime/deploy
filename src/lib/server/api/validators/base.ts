import { injectable } from '@needle-di/core';

export interface ValidationResult {
	success: boolean;
	message: string;
}

export interface GuideValidator {
	readonly guideId: string;
	canValidate(step: string): boolean;
	validate(step: string, payload: any): Promise<ValidationResult>;
}

@injectable()
export class BaseGuideValidator implements GuideValidator {
	readonly guideId: string = '';

	canValidate(step: string): boolean {
		return false;
	}

	async validate(step: string, payload: any): Promise<ValidationResult> {
		return {
			success: false,
			message: 'Not implemented'
		};
	}
}
