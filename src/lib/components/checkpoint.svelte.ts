import { getContext, setContext } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

export const checkpointContextKey = Symbol('checkpointContext');

export type CheckpointContext = {
	currentStep: number;
	stepCounter: number; // the current step number, used while initializing the context
	completedSteps: Set<string>;
	guideId: string;
	inputValues: Map<string, string>; // Store input values by guideId:step
	resultMessages: Map<string, string>; // Store result messages by guideId:step
};

let contextInstance: CheckpointContext | null = null;

export const initCheckpointContext = () => {
	const context = $state({
		currentStep: 0,
		stepCounter: 0,
		completedSteps: new SvelteSet<string>(),
		guideId: '',
		inputValues: new SvelteMap<string, string>(),
		resultMessages: new SvelteMap<string, string>()
	});

	setContext(checkpointContextKey, context);
	contextInstance = context;
	return context;
};

export const getCheckpointContext = () => {
	if (contextInstance) {
		return contextInstance;
	}

	// This will only run during component initialization
	const context = getContext<CheckpointContext>(checkpointContextKey);
	if (!context) {
		throw new Error('Checkpoint context not found - must call initCheckpointContext first');
	}
	contextInstance = context;
	return context;
};

export const markStepCompleted = (guideId: string, step: string) => {
	if (!contextInstance) {
		throw new Error('Context not initialized');
	}
	contextInstance.completedSteps.add(`${guideId}:${step}`);
};

export const isStepCompleted = (guideId: string, step: string) => {
	if (!contextInstance) {
		return false;
	}
	return contextInstance.completedSteps.has(`${guideId}:${step}`);
};

export const setGuideId = (guideId: string) => {
	if (!contextInstance) {
		throw new Error('Context not initialized');
	}
	contextInstance.guideId = guideId;
};

export const getGuideId = () => {
	if (!contextInstance) {
		return '';
	}
	return contextInstance.guideId;
};

export const saveInputValue = (guideId: string, step: string, value: string) => {
	if (!contextInstance) {
		throw new Error('Context not initialized');
	}
	contextInstance.inputValues.set(`${guideId}:${step}`, value);
};

export const getInputValue = (guideId: string, step: string): string => {
	if (!contextInstance) {
		return '';
	}
	return contextInstance.inputValues.get(`${guideId}:${step}`) || '';
};

export const saveResultMessage = (guideId: string, step: string, message: string) => {
	if (!contextInstance) {
		throw new Error('Context not initialized');
	}
	contextInstance.resultMessages.set(`${guideId}:${step}`, message);
};

export const getResultMessage = (guideId: string, step: string): string => {
	if (!contextInstance) {
		return '';
	}
	return contextInstance.resultMessages.get(`${guideId}:${step}`) || '';
};
