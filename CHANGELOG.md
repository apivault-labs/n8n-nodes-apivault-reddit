# Changelog

## 0.1.0

- Initial release.
- `Reddit Profile Scraper` node: scrape public Reddit user profiles in real
  time (no login).
- Fields: username, display name, bio, follower/following/post (karma) counts,
  profile URL, website, category, other metadata — each toggleable.
- Accepts bare usernames or full Reddit profile URLs (/user/ and /u/).
- Concurrency, timeout and retry controls.
- `Apify API` credentials with token test against `/users/me`.
- Calls the `apivault_labs/reddit-scraper` actor via
  `run-sync-get-dataset-items`.
