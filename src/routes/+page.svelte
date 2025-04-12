<script lang="ts">
	import { authClient } from '$lib/auth';

	const handleSlackSignIn = async () => {
		try {
			const response = await authClient.signIn.oauth2({
				providerId: 'slack',
				callbackURL: '/'
			});
		} catch (error) {
			console.error('Failed to sign in with Slack:', error);
		}
	};

	const { data } = $props();
	const { user } = $derived(data);
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

{#if !user}
	<div class="auth-container">
		<button class="slack-button" on:click={handleSlackSignIn}>
			<img src="https://cdn.svelte.dev/slack.svg" alt="Slack logo" width="20" height="20" />
			Sign in with Slack
		</button>
	</div>
{/if}

<style>
	.auth-container {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
	}

	.slack-button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background-color: #4a154b;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 0.375rem;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.slack-button:hover {
		background-color: #611f63;
	}

	.slack-button:focus {
		outline: 2px solid #4a154b;
		outline-offset: 2px;
	}

	.slack-button img {
		display: inline-block;
		vertical-align: middle;
	}
</style>
