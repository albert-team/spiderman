# DEPRECATED

- _done_ event of `Scheduler`
- `Scheduler.scrapeUrl()` for _public use_
- `SchedulerOptions.verbose` in favor of `SchedulerOptions.logLevel`

# TODO

## New Features

- Auto throttle smarter
- Add more tests
- `DataProcessor` supports pipeline
- Add `Scheduler.pause()` and `Scheduler.resume()`
- Add `Scheduler.start(initUrls)`

## Breaking Changes

- Remove _done_ event of `Scheduler`
- Remove `initUrl` parameter in `Scheduler` constructor
- Remove `SchedulerOptions.verbose`
