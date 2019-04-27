# TODO

- Auto throttle smarter
- Add more unit tests, especially those for `Scheduler`
- Use CI
- `DataProcessor` supports pipeline
- `Scheduler` supports `pause()` and `resume()`
- `Scheduler.start(initUrls)`
- Deprecate `SchedulerOptions.verbose` in favor of `SchedulerOptions.logLevel`

## Breaking Changes

- Remove _done_ event of `Scheduler`
- Remove `initUrl` parameter in `Scheduler` constructor
- Remove `SchedulerOptions.verbose`
