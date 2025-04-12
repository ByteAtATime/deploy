<script lang="ts">
	import { page } from '$app/state';
	import {
		getCheckpointContext,
		initCheckpointContext,
		setGuideId,
		saveInputValue,
		saveResultMessage
	} from '$lib/components/checkpoint.svelte.js';
	import { onMount, type Snippet } from 'svelte';

	type Props = {
		title: string;
		description: string;
		difficulty: string;
		estimatedTime: string;
		data: {
			checkpointData?: {
				completedSteps: string[];
				inputValues: Record<string, string>;
				resultMessages: Record<string, string>;
			};
		};
		children: Snippet;
	};

	const { title, description, difficulty, estimatedTime, data = {}, children }: Props = $props();

	const context = initCheckpointContext();

	$effect(() => {
		context.stepCounter = 0;
	});

	function getStepNumber(step: string): number {
		const stepMap: Record<string, number> = {
			'repository-fork': 0,
			'commit-check': 1,
			deployment: 2
		};
		return stepMap[step] !== undefined ? stepMap[step] : -1;
	}

	const path = page.url.pathname;
	const guidesMatch = path.match(/\/guides\/([^\/]+)/);

	if (guidesMatch && guidesMatch[1]) {
		const guideId = guidesMatch[1];
		setGuideId(guideId);
		context.guideId = guideId;

		const checkpointData = data?.checkpointData || {
			completedSteps: [],
			inputValues: {},
			resultMessages: {}
		};

		if (checkpointData.completedSteps) {
			checkpointData.completedSteps.forEach((step: string) => {
				context.completedSteps.add(step);
			});
		}

		if (checkpointData.inputValues) {
			Object.entries(checkpointData.inputValues).forEach(([key, value]) => {
				saveInputValue(key.split(':')[0], key.split(':')[1], value);
			});
		}

		if (checkpointData.resultMessages) {
			Object.entries(checkpointData.resultMessages).forEach(([key, value]) => {
				saveResultMessage(key.split(':')[0], key.split(':')[1], value);
			});
		}

		let maxStep = -1;
		context.completedSteps.forEach((stepKey) => {
			if (stepKey.startsWith(`${context.guideId}:`)) {
				const stepNumber =
					context.guideId === 'vercel'
						? getStepNumber(stepKey.split(':')[1])
						: parseInt(stepKey.split(':')[1], 10);

				if (!isNaN(stepNumber) && stepNumber > maxStep) {
					maxStep = stepNumber;
				}
			}
		});

		if (maxStep >= 0) {
			context.currentStep = maxStep + 1;
		}
	}
</script>

<div class="prose prose-img:rounded mx-auto py-8">
	<div class="not-prose">
		<h1 class="mb-2 text-4xl font-bold text-black">{title}</h1>

		<p class="-mb-4 text-gray-500">{description}</p>
	</div>

	{@render children()}
</div>
