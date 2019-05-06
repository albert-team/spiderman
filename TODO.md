# DEPRECATED

- _done_ event of `Scheduler`
- `Scheduler.scrapeUrl()` for _public use_

# TODO

## New Features

- Auto throttle smarter
- Add more tests
- `DataProcessor` supports pipeline
- Add `Scheduler.pause()` and `Scheduler.resume()`
- Add `Scheduler.start(initUrls)`
- Deprecate `SchedulerOptions.verbose` in favor of `SchedulerOptions.logLevel`

## Breaking Changes

- Remove _done_ event of `Scheduler`
- Remove `initUrl` parameter in `Scheduler` constructor
- Remove `SchedulerOptions.verbose`
