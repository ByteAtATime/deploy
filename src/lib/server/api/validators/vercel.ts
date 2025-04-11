import { injectable } from '@needle-di/core';
import { BaseGuideValidator } from './base';
import type { ValidationResult } from './base';

@injectable()
export class VercelGuideValidator extends BaseGuideValidator {
	readonly guideId = 'vercel';
	private validSteps = ['repository-fork', 'commit-check', 'deployment'];

	canValidate(step: string): boolean {
		return this.validSteps.includes(step);
	}

	async validate(step: string, payload: any): Promise<ValidationResult> {
		switch (step) {
			case 'repository-fork':
				return this.validateGithubReadmeComment(payload.url);
			case 'commit-check':
				return this.validateOwnerCommit(payload.url);
			case 'deployment':
				return this.validateVercelDeployment(payload.url, payload.slackId);
			default:
				return {
					success: false,
					message: `Unknown step: ${step}`
				};
		}
	}

	private async validateGithubReadmeComment(repoUrl: string): Promise<ValidationResult> {
		try {
			const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
			const match = repoUrl.match(urlPattern);

			if (!match) {
				return {
					success: false,
					message: 'Invalid GitHub repository URL'
				};
			}

			const [, username, repo] = match;

			const readmeUrl = `https://raw.githubusercontent.com/${username}/${repo}/main/README.md`;
			const response = await fetch(readmeUrl);

			if (!response.ok) {
				return {
					success: false,
					message: 'Could not fetch README.md. Make sure the repository exists and is public.'
				};
			}

			const readmeContent = await response.text();
			const expectedComment = 'Orpheus X Heidi';

			if (readmeContent.includes(expectedComment)) {
				return {
					success: true,
					message: 'Great job! Your repository has correctly been forked.'
				};
			} else {
				return {
					success: false,
					message: `Something is wrong with your fork. Make sure you've forked the correct repository and have not made any changes.`
				};
			}
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'An unknown error occurred'
			};
		}
	}

	private async validateOwnerCommit(repoUrl: string): Promise<ValidationResult> {
		try {
			const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
			const match = repoUrl.match(urlPattern);

			if (!match) {
				return {
					success: false,
					message: 'Invalid GitHub repository URL'
				};
			}

			const [, username, repo] = match;

			const commitsUrl = `https://api.github.com/repos/${username}/${repo}/commits?author=${username}`;
			const response = await fetch(commitsUrl);

			if (!response.ok) {
				return {
					success: false,
					message: 'Could not fetch commits. Make sure the repository exists and is public.'
				};
			}

			const commits = await response.json();

			if (Array.isArray(commits) && commits.length > 0) {
				return {
					success: true,
					message: `Great job! We found your commits.`
				};
			} else {
				return {
					success: false,
					message:
						'No commits found! Make sure you have made at least one commit to the repository.'
				};
			}
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'An unknown error occurred'
			};
		}
	}

	private async validateVercelDeployment(
		deployUrl: string,
		slackId?: string
	): Promise<ValidationResult> {
		try {
			if (!deployUrl.includes('vercel.app')) {
				return {
					success: false,
					message: 'Please provide a valid Vercel deployment URL (should include vercel.app)'
				};
			}

			const response = await fetch(deployUrl);

			if (!response.ok) {
				return {
					success: false,
					message:
						'Your Vercel deployment does not appear to be live. Make sure the URL is correct and the site has been deployed.'
				};
			}

			if (slackId) {
				const content = await response.text();
				const expectedText = `Created by ${slackId}`;

				if (!content.includes(expectedText)) {
					return {
						success: false,
						message: `Your deployment is missing the required text: "${expectedText}". Make sure your App.tsx file has the correct SlackID.`
					};
				}
			}

			return {
				success: true,
				message: slackId
					? 'Great job! Your Vercel deployment is live and contains your Slack ID.'
					: 'Great job! Your Vercel deployment is live and working correctly.'
			};
		} catch (error) {
			return {
				success: false,
				message:
					error instanceof Error
						? error.message
						: 'An unknown error occurred accessing your deployment'
			};
		}
	}
}
