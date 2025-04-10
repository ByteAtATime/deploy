import { getContext, setContext } from "svelte";

export const checkpointContextKey = Symbol('checkpointContext');

export type CheckpointContext = {
    currentStep: number;
    stepCounter: number; // the current step number, used while initializing the context
};

const checkpointContext = $state({
    currentStep: 0,
    stepCounter: 0,
})

export const initCheckpointContext = () => {
    setContext(checkpointContextKey, checkpointContext);
};

export const getCheckpointContext = () => {
    const context = getContext<CheckpointContext>(checkpointContextKey);
    if (!context) {
        throw new Error('Checkpoint context not found');
    }
    return context;
};

