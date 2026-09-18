import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

const ACTOR_ID = 'apivault_labs~reddit-scraper';

export class Reddit implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Reddit Profile Scraper',
		name: 'reddit',
		icon: 'file:reddit.svg',
		group: ['transform'],
		version: 1,
		description: 'Scrape Reddit public profiles — usernames, karma, bios, followers, websites. No login, no API key required. Auto-retries transient fetch failures. $0.002 per profile ($2 per 1,000).',
		defaults: { name: 'Reddit Profile Scraper' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'apifyApi', required: true }],
		properties: [
   {
      "displayName": "Reddit User Profile URLs",
      "name": "profileUrls",
      "description": "List of Reddit user profile URLs to scrape (comma or new-line separated)",
      "type": "string",
      "default": "",
      "required": true
   },
   {
      "displayName": "Username",
      "name": "extractUsername",
      "description": "Extract Reddit username",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Display Name",
      "name": "extractFullName",
      "description": "Extract display name (if set)",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Bio / Description",
      "name": "extractBio",
      "description": "Extract bio text",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Follower Count",
      "name": "extractFollowers",
      "description": "Extract follower count",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Following Count",
      "name": "extractFollowing",
      "description": "Extract following count",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Post / Karma Count",
      "name": "extractPosts",
      "description": "Extract post count or karma",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Profile URL",
      "name": "extractProfileUrl",
      "description": "Include profile URL in output",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Website",
      "name": "extractWebsite",
      "description": "Extract website URL",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Category",
      "name": "extractCategory",
      "description": "Extract user category",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Other Metadata (karma, cake day, trophies)",
      "name": "extractMetadata",
      "description": "Extract karma breakdown, cake day, trophies, active subreddits",
      "type": "boolean",
      "default": true
   },
   {
      "displayName": "Max Concurrency",
      "name": "maxConcurrency",
      "description": "Number of parallel requests (recommended: 5-10)",
      "type": "number",
      "default": 5,
      "typeOptions": {
         "minValue": 1,
         "maxValue": 20
      }
   },
   {
      "displayName": "Timeout per profile (seconds)",
      "name": "timeout",
      "description": "Max wait time per profile",
      "type": "number",
      "default": 90,
      "typeOptions": {
         "minValue": 30,
         "maxValue": 300
      }
   },
   {
      "displayName": "Retries on transient failure",
      "name": "maxRetries",
      "description": "If a profile fails to fetch (transient throttling), retry this many times with backoff. Recovers most intermittent failures.",
      "type": "number",
      "default": 3,
      "typeOptions": {
         "minValue": 0,
         "maxValue": 5
      }
   }
],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			try {
				const body: Record<string, unknown> = {};
				{ const _v = this.getNodeParameter("profileUrls", i, '') as string; const _a = _v.split(/[,\n]/).map(s=>s.trim()).filter(s=>s.length>0); if (_a.length) body["profileUrls"] = _a; }
				body["extractUsername"] = this.getNodeParameter("extractUsername", i);
				body["extractFullName"] = this.getNodeParameter("extractFullName", i);
				body["extractBio"] = this.getNodeParameter("extractBio", i);
				body["extractFollowers"] = this.getNodeParameter("extractFollowers", i);
				body["extractFollowing"] = this.getNodeParameter("extractFollowing", i);
				body["extractPosts"] = this.getNodeParameter("extractPosts", i);
				body["extractProfileUrl"] = this.getNodeParameter("extractProfileUrl", i);
				body["extractWebsite"] = this.getNodeParameter("extractWebsite", i);
				body["extractCategory"] = this.getNodeParameter("extractCategory", i);
				body["extractMetadata"] = this.getNodeParameter("extractMetadata", i);
				body["maxConcurrency"] = this.getNodeParameter("maxConcurrency", i);
				body["timeout"] = this.getNodeParameter("timeout", i);
				body["maxRetries"] = this.getNodeParameter("maxRetries", i);
				const options: IRequestOptions = {
					method: 'POST' as IHttpRequestMethods,
					url: `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`,
					body,
					json: true,
				};
				const response = await this.helpers.requestWithAuthentication.call(this, 'apifyApi', options);
				const results = Array.isArray(response) ? response : [response];
				for (const result of results) returnData.push({ json: result, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}
		return [returnData];
	}
}
