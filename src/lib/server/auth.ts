import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { createAuthMiddleware, genericOAuth } from "better-auth/plugins";
import { env as publicEnv } from "$env/dynamic/public";
import { env } from "$env/dynamic/private";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg"
    }),
    baseURL: publicEnv.PUBLIC_BETTER_AUTH_URL!,
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: "slack",
                    clientId: env.SLACK_CLIENT_ID!,
                    clientSecret: env.SLACK_CLIENT_SECRET!,
                    discoveryUrl: "https://slack.com/.well-known/openid-configuration",
                    scopes: ["openid", "email", "profile"]
                }
            ]
        })
    ]
});