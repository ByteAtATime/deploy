import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

import { authClient } from '$lib/auth';
import { auth } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ request }) => {
	const { session } =
		(await auth.api.getSession({
			headers: request.headers
		})) ?? {};

	if (!session) {
		throw redirect(303, '/login');
	}

	const accounts = await auth.api.listUserAccounts({
		headers: request.headers
	});

	const slackAccount = accounts.find((account) => account.provider === 'slack');

	if (!slackAccount) {
		return { slackId: null };
	}

	return { slackId: slackAccount.accountId };
};
