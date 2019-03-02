# CHANGELOG

## v1.0.0-canary.2

- FIXED: Upgrade `@albert-team/rebloom` to fix missing .so file bug

## v1.0.0-canary.1

- NEW: Add duplicate URL filter
- NEW: Maximum number of active scrapers and data processors in `Scheduler` are customizable
- CHANGED: Change some internal behaviors of `Scheduler`
- CHANGED: Migrate from ESDoc to JSDoc

## v1.0.0-canary.0

- NEW: `Scheduler` now supports retrying if failed
- CHANGED: Restructure the project
- CHANGED: Change versioning scheme
- CHANGED: `Scraper` and `DataProcessor` don't retry once if failed

## v0.3.1 (Canary)

- FIXED: `Scheduler` not handle asynchronous tasks properly in while loop

## v0.3.0 (Canary)

- NEW: Deploy documentation to GitHub Pages
- CHANGED: Use xxhashjs instead of metrohash to get URL fingerprint by default

## v0.2.0 (Canary)

- CHANGED: Increase the default timeout of `Scraper` request from 1s to 10s
- FIXED: HTTP proxies won't work with HTTPS websites

## v0.1.1 (Canary)

- FIXED: Entities not exported

## v0.1.0 (Canary)

- NEW: Add 3 main components: `Scheduler` as the manager, `Scraper` and `DataProcessor` as agents
