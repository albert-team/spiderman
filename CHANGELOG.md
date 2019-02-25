# CHANGELOG

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
