import { auth } from "$lib/server/auth";
import { isAuthPath, svelteKitHandler } from "better-auth/svelte-kit";

export async function handle({ event, resolve }) {
	event.url.protocol = "https";
	return svelteKitHandler({ event, resolve, auth });
}