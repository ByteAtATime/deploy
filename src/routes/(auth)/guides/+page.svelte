<script lang="ts">
	const guides = [
		{
			title: 'Deploy with Vercel',
			description: "Learn how to deploy your web applications using Vercel's platform.",
			path: '/guides/vercel',
			icon: '🚀',
			difficulty: 'Beginner'
		}
	];
</script>

<div class="mx-auto max-w-4xl p-6">
	<h1 class="mb-8 text-3xl font-bold">Deployment Guides</h1>
	<p class="mb-8 text-gray-600">Choose a guide below to learn how to deploy your project!</p>

	<div class="grid gap-6 md:grid-cols-2">
		{#each guides as guide}
			<a
				href={guide.path}
				class="block rounded-lg bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
			>
				<div class="mb-4 text-4xl">{guide.icon}</div>
				<h2 class="mb-2 text-xl font-semibold">{guide.title}</h2>
				<p class="mb-4 text-gray-600">{guide.description}</p>
				<div class="flex items-center">
					<span class="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
						{guide.difficulty}
					</span>
				</div>
			</a>
		{/each}
	</div>
</div>
