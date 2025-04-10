<script lang="ts">
	import {
		getCheckpointContext,
		initCheckpointContext
	} from '$lib/components/checkpoint.svelte.js';

	const { title, description, difficulty, estimatedTime } = $props();

	initCheckpointContext();

	$effect(() => {
		getCheckpointContext().stepCounter = 0;
	});
</script>

<div class="prose prose-img:rounded mx-auto py-8">
	<div class="not-prose">
		<h1 class="mb-2 text-4xl font-bold text-black">{title}</h1>

		<p class="-mb-4 text-gray-500">{description}</p>
	</div>

	<slot />
</div>
