import { authClient } from '$lib/auth';

export const load = async () => {
	const session = await authClient.getSession();

	if (session.error || !session.data) {
		return { user: null, session: null };
	}

	return session.data;
};
