# DEPRECATED

- _done_ event of `Scheduler` in favor of _idle_ event
- `Scheduler.scrapeUrl()` for _public use_
- `SchedulerOptions.verbose` in favor of `SchedulerOptions.logLevel`

# TODO

## New Features

- Auto throttle smarter
- Add more tests
- `DataProcessor` supports pipeline

## Breaking Changes

- Remove _done_ event of `Scheduler`
- Remove `initUrl` parameter in `Scheduler` constructor in favor of `Scheduler.start(initUrls)`
- Remove `SchedulerOptions.verbose`
