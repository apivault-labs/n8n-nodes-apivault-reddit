import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

// Apify actor that does the real work (runs server-side, billed pay-per-event).
const ACTOR_ID = 'apivault_labs~reddit-scraper';

export class Reddit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Reddit Profile Scraper',
		name: 'reddit',
		icon: 'file:reddit.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["profileUrls"]}}',
		description:
			'Scrape public Reddit user profiles in real time: username, display name, bio, karma/follower counts, website, category and public metadata. No login.',
		defaults: {
			name: 'Reddit Profile Scraper',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Reddit Profile URLs or Usernames',
				name: 'profileUrls',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				required: true,
				placeholder: 'https://www.reddit.com/user/spez/',
				description:
					'One or more Reddit profile URLs (/user/NAME/ or /u/NAME) or bare usernames. Separate multiple with a new line or comma.',
			},
			{
				displayName: 'Fields to Extract',
				name: 'fields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				description: 'Toggle which fields to extract. All on by default.',
				options: [
					{ displayName: 'Username', name: 'extractUsername', type: 'boolean', default: true, description: 'Whether to extract the Reddit username' },
					{ displayName: 'Display Name', name: 'extractFullName', type: 'boolean', default: true, description: 'Whether to extract the display name (if set)' },
					{ displayName: 'Bio / Description', name: 'extractBio', type: 'boolean', default: true, description: 'Whether to extract the bio text' },
					{ displayName: 'Follower Count', name: 'extractFollowers', type: 'boolean', default: true, description: 'Whether to extract the follower count' },
					{ displayName: 'Following Count', name: 'extractFollowing', type: 'boolean', default: true, description: 'Whether to extract the following count' },
					{ displayName: 'Post / Karma Count', name: 'extractPosts', type: 'boolean', default: true, description: 'Whether to extract the post count or karma' },
					{ displayName: 'Profile URL', name: 'extractProfileUrl', type: 'boolean', default: true, description: 'Whether to include the profile URL in the output' },
					{ displayName: 'Website', name: 'extractWebsite', type: 'boolean', default: true, description: 'Whether to extract the website URL' },
					{ displayName: 'Category', name: 'extractCategory', type: 'boolean', default: true, description: 'Whether to extract the user category' },
					{ displayName: 'Other Metadata', name: 'extractMetadata', type: 'boolean', default: true, description: 'Whether to extract karma breakdown, cake day, trophies, Reddit Premium' },
				],
			},
			{
				displayName: 'Advanced Options',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Max Concurrency',
						name: 'maxConcurrency',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 20 },
						default: 5,
						description: 'Number of profiles to scrape in parallel',
					},
					{
						displayName: 'Timeout per Profile (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: { minValue: 30, maxValue: 300 },
						default: 90,
						description: 'Max wait time per profile',
					},
					{
						displayName: 'Retries on Transient Failure',
						name: 'maxRetries',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 5 },
						default: 3,
						description: 'Retries (with backoff) when a profile fails to fetch',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const rawUrls = this.getNodeParameter('profileUrls', i) as string;
				const profileUrls = rawUrls
					.split(/[\n,]+/)
					.map((u) => u.trim())
					.filter((u) => u.length > 0)
					.map((u) => {
						// accept bare usernames -> canonical profile URL
						if (/^https?:\/\//i.test(u)) return u;
						const name = u.replace(/^@\/?/, '').split('/')[0];
						return `https://www.reddit.com/user/${name}/`;
					});

				if (profileUrls.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'At least one Reddit profile URL or username is required',
						{ itemIndex: i },
					);
				}

				const fields = this.getNodeParameter('fields', i, {}) as Record<string, boolean>;
				const advanced = this.getNodeParameter('advancedOptions', i, {}) as {
					maxConcurrency?: number;
					timeout?: number;
					maxRetries?: number;
				};

				const body: Record<string, unknown> = {
					profileUrls,
					// field toggles (defaults match the actor's input schema)
					extractUsername: fields.extractUsername ?? true,
					extractFullName: fields.extractFullName ?? true,
					extractBio: fields.extractBio ?? true,
					extractFollowers: fields.extractFollowers ?? true,
					extractFollowing: fields.extractFollowing ?? true,
					extractPosts: fields.extractPosts ?? true,
					extractProfileUrl: fields.extractProfileUrl ?? true,
					extractWebsite: fields.extractWebsite ?? true,
					extractCategory: fields.extractCategory ?? true,
					extractMetadata: fields.extractMetadata ?? true,
					// advanced
					maxConcurrency: advanced.maxConcurrency ?? 5,
					timeout: advanced.timeout ?? 90,
					maxRetries: advanced.maxRetries ?? 3,
				};

				const options: IRequestOptions = {
					method: 'POST' as IHttpRequestMethods,
					url: `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`,
					body,
					json: true,
				};

				const response = await this.helpers.requestWithAuthentication.call(
					this,
					'apifyApi',
					options,
				);

				const results = Array.isArray(response) ? response : [response];
				for (const result of results) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
