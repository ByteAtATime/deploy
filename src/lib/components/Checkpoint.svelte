<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getCheckpointContext } from './checkpoint.svelte.js';

	type ValidationResult = {
		success: boolean;
		message: string;
	};

	type GuideStep = {
		guideId: string;
		step: string;
		url?: string;
		slackId?: string;
	};

	type Props = {
		title: string;
		inputLabel: string;
		placeholder: string;
		successMessage: string;
		children: Snippet;
		pending: Snippet;
		success: Snippet;
		guideId: string;
		step: string;
		slackId?: string;
		validator?: (input: string) => Promise<ValidationResult>;
		onSuccess: () => void;
		onFailure: () => void;
	};
	
	const {
		title,
		inputLabel,
		placeholder,
		successMessage,
		guideId,
		step,
		slackId,
		validator,
		onSuccess,
		onFailure,
		children,
		pending,
		success
	}: Props = $props();

	let inputValue: string = $state('');
	let isVerifying: boolean = $state(false);
	let verificationResult: 'pending' | 'success' | 'error' = $state('pending');
	let resultMessage: string = $state('');

	let ctx = getCheckpointContext();

	let index = ctx.stepCounter++;

	async function validateGuideStep(
		guideId: string,
		step: string,
		url: string,
		slackId?: string
	): Promise<ValidationResult> {
		try {
			const payload: Record<string, any> = { url };
			if (slackId) {
				payload.slackId = slackId;
			}

			const response = await fetch(`/api/guides/${guideId}/validate/${step}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			return await response.json();
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'An unknown error occurred'
			};
		}
	}

	async function verify() {
		if (!inputValue.trim()) {
			resultMessage = 'Please enter a value';
			verificationResult = 'error';
			return;
		}

		isVerifying = true;
		verificationResult = 'pending';
		resultMessage = '';

		try {
			let result: ValidationResult;
			
			if (validator) {
				// Use the custom validator if provided
				result = await validator(inputValue);
			} else {
				// Otherwise use the built-in API call
				result = await validateGuideStep(guideId, step, inputValue, slackId);
			}

			if (result.success) {
				verificationResult = 'success';
				resultMessage = result.message;
				ctx.currentStep++;
				console.log(ctx.currentStep);
				onSuccess?.();
			} else {
				verificationResult = 'error';
				resultMessage = result.message;
				onFailure?.();
			}
		} catch (error) {
			verificationResult = 'error';
			resultMessage = error instanceof Error ? error.message : 'An unknown error occurred';
			onFailure?.();
		} finally {
			isVerifying = false;
		}
	}
</script>

{#if ctx.currentStep >= index}
	{@render children()}

	<div class="not-prose checkpoint-container mt-4 mb-8 rounded-md border border-gray-200 p-4">
		<h3 class="mb-2 text-lg font-medium">{title}</h3>
		<p class="mb-4">{inputLabel}</p>

		<div class="flex flex-col gap-2">
			<input
				type="text"
				bind:value={inputValue}
				{placeholder}
				class="rounded-md border border-gray-300 p-2"
				disabled={isVerifying || verificationResult === 'success'}
			/>

			<button
				onclick={verify}
				disabled={isVerifying || verificationResult === 'success'}
				class="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if isVerifying}
					Verifying...
				{:else if verificationResult === 'success'}
					Verified! ✓
				{:else}
					Verify
				{/if}
			</button>
		</div>

		{#if resultMessage}
			<p class="mt-2 {verificationResult === 'success' ? 'text-green-500' : 'text-red-500'}">
				{resultMessage}
			</p>
		{/if}

		{#if verificationResult === 'success'}
			<div class="mt-2">
				{@render success?.()}
			</div>
		{:else}
			<div class="mt-2 opacity-50">
				{@render pending?.()}
			</div>
		{/if}
	</div>
{/if}
