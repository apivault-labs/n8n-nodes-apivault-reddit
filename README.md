# n8n-nodes-apivault-reddit

An [n8n](https://n8n.io) community node for the **Reddit Profile Scraper** — scrape public Reddit user profiles in real time, no login.

No login, no API key. Pay-as-you-go, no monthly subscription. The scraping runs server-side on [Apify](https://apify.com); this node is a thin connector you drive with your own Apify API token.

Built by **[apivault_labs](https://apify.com/apivault_labs)** — see [all our actors](https://apify.com/apivault_labs).

## What you get per profile

- `username`, `displayName`, `bio`
- `followerCount`, `followingCount`, `postCount`
- `profileUrl`, `website`, `category`
- `otherMetadata` (cake day, trophies, Reddit Premium…)

## Installation

In your n8n instance:

1. Go to **Settings → Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-apivault-reddit`
4. Confirm and install

## Credentials

This node uses an **Apify API token**:

1. Create a free account at [apify.com](https://apify.com)
2. Go to **Apify Console → Settings → Integrations** and copy your **API token**
3. In n8n, create new **Apify API** credentials and paste the token

A free Apify account includes monthly usage credits.

## Usage

- **Reddit Profile URLs or Usernames** — one or more `https://www.reddit.com/user/NAME/` URLs or bare usernames (one per line, or comma-separated)
- **Fields to Extract** — toggle any of the 10 fields
- **Advanced** — concurrency (1-20), timeout, retries

## Pricing

Billed per profile through Apify (pay-per-event): **$2 / 1,000 profiles** ($0.002 each). You pay only for profiles that scrape successfully.

## Use cases

- **Audience & creator research** — pull bios, categories and links at scale
- **Influencer discovery** — find and qualify Reddit personalities
- **Content & market research** — study who's active in your niche
- **Lead enrichment** — add Reddit presence to existing records

## Resources

- [Reddit Profile Scraper actor on Apify](https://apify.com/apivault_labs/reddit-scraper)
- [All actors by apivault_labs](https://apify.com/apivault_labs)
- Prefer Python? Use the [Python SDK](https://github.com/apivault-labs/reddit-profile-scraper-python)
- [n8n community nodes docs](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)

## Keywords

`reddit-scraper` `reddit-profile` `social-media-scraper` `no-login` `audience-research` `influencer-discovery` `content-research` `market-research` `n8n` `apify`
