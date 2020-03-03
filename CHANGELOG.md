# CHANGELOG

## v1.14.0

### FEATURES

- Require Node >= 10
- Upgrade _@albert-team/rebloom_ to v2, which requires _RedisBloom_ v2 too
- All entity interfaces and classes are exported under `"@albert-team/spiderman/entities"`
- All option interfaces and classes are exported under `"@albert-team/spiderman/options"`
- Fix missing non-exported entities in docs
- Deprecate `ProxyEntity`, use `ProxyEntityInterface` instead. In the future, `ProxyEntity` symbol will be replaced with `ProxyEntityInterface`
- Deprecate `SchedulerOptions.verbose` in code
- Deprecate `Scheduler.getStats()`, use `Scheduler.stats` instead
- Deprecate `Scraper.url`, use `ParsingMeta` instead
- Deprecate `Statistics.get()`

## v1.13.0

### FEATURES

- Support passing a custom _Pino_ instance to `Scheduler` via `SchedulerOptions.logger`
- `Scraper` and `DataProcessor` have their own logger and support `logLevel` and `logger` options like those of `Scheduler`
- Make all loggers public readonly
- Write fewer logs by default
- Remove unused code

### PATCHES

- `Scraper` now considers HTTP status code 2xx successful

## v1.12.0

### FEATURES

- Add `Scheduler.pause()` and `Scheduler.resume()`
- Revamp duplicate filter
- Write logs on events finished instead of events started
- Fewer unnecessary async in `Scheduler`

### PATCHES

- Fix a typo in `Scheduler` _(only affects v1.11.x)_ that sometimes makes it emit _idle/done_ event early

## v1.11.0, v1.11.1, v1.11.2

### FEATURES

- `Scheduler.getStats()` returns `Statistics`, not plain object only

### PATCHES

- All interfaces are exported and recognized now

## v1.10.0

### FEATURES

- Add `SchedulerOptions.logLevel`
- Improve `Statistics` inner data structures
- Deprecate `SchedulerOptions.verbose`

### PATCHES

- `ClassificationResult` interface not recognized in the documentation

## v1.9.0

### FEATURES

- Revamp `Statistics` class
- Add `Scheduler.getStats()`
- Use _Travis CI_
- Auto deploy package to NPM, deploy documentation to Github Pages and release new version on Github
- Use `Date` object instead of `process.hrtime` to collect statistics

## v1.9.0-beta.1

### FEATURES

- Add `Scraper.url`
- Support TypeScript packaging better

## v1.9.0-beta.0

### FEATURES

- Add _Typedoc_
- Add `Scheduler.scheduleUrlEntity()`

## v1.9.0-canary.0

### FEATURES

- Migrate to TypeScript
- Code optimization
- Temporarily remove documentation page

## v1.8.0

### FEATURES

- Measure performance of scraping and data processing tasks
- Collect statistics
- Improve log messages

### PATCHES

- `Scheduler.scheduleUrl()` should return immediately now

## v1.7.0

### FEATURES

- `Scheduler.initUrl` is nullable now
- Add `Scheduler.scheduleUrl()` as an alternative to `Scheduler.scrapeUrl()`, which runs immediately, to take advantage of _bottleneck_ rate limiter
- Mark `Scheduler.scrapeUrl()` private once again, hence deprecated for public use

## v1.6.0

### FEATURES

- `Scheduler.scrapeUrl()` is now public
- Remove _xxhashjs_
- Deprecate _done_ event, use _idle_ instead

### PATCHES

- Handle idle state of `Scheduler` properly

## v1.5.1

### PATCHES

- Fix a minor bug in the documentation

## v1.5.0

### FEATURES

- `Scheduler.classifyUrl()` supports optional custom `UrlEntity` as "urlEntity" in result object
- Always show "pid" and "hostname" in logs. `SchedulerOptions.verbose` means "debug", not "info"
- _Redis_ with _RedisBloom_ is now optional and disabled by default

### PATCHES

- Fix an edge case where `Scheduler` doesn't automatically stop

## v1.4.0

### FEATURES

- Improve `Scheduler` logger. Add `SchedulerOptions.verbose`, which is false by default, to specify level of details of the logger
- `Scheduler` queues once again wait 100ms before launching another task

## v1.3.0

### FEATURES

- Change some private APIs of `Scheduler`

## v1.2.0

### FEATURES

- Add `tasksPerMinPerQueue` option for `Scheduler`
- Add `Scraper.process()` which can be overrided to manually process a URL
- Change some default values of `Scheduler` to maximize performance
- Now `Scheduler` is an `EventEmitter` and has _done_ event. Hence, `Scheduler` doesn't automatically stop and disconnect once finished anymore, again

## v1.1.0

### FEATURES

- `Scheduler.classifyUrl()` returns `null` or `undefined` to discard and `dataProcessor` property is optional
- Lower the priority of retried tasks

## v1.0.0

### FEATURES

- Change some default values of `Scheduler`

### PATCHES

- Fix `Scraper` and `DataProcessor`

## v1.0.0-beta.1

### FEATURES

- Start writing logs with _Pino_
- Reduce package size by not publishing irrelevant files
- `Scheduler` once again automatically stop and disconnect once finished

## v1.0.0-beta.0

### FEATURES

- Start writing tests with _Jest_
- Simplify `Scheduler` by using `bottleneck`
- Many internal changes
- `Scheduler` doesn't automatically stop and disconnect once finished anymore

## v1.0.0-canary.2

### PATCHES

- Upgrade _@albert-team/rebloom_ to fix missing .so file bug

## v1.0.0-canary.1

### FEATURES

- Add duplicate URL filter
- Maximum number of active scrapers and data processors in `Scheduler` are customizable
- Change some internal behaviors of `Scheduler`
- Migrate from _ESDoc_ to _JSDoc_

## v1.0.0-canary.0

### FEATURES

- `Scheduler` now supports retrying if failed
- Restructure the project
- Change versioning scheme
- `Scraper` and `DataProcessor` don't retry once if failed

## v0.3.1 (Canary)

### PATCHES

- `Scheduler` not handle asynchronous tasks properly in while loop

## v0.3.0 (Canary)

### FEATURES

- Deploy documentation to GitHub Pages
- Use _xxhashjs_ instead of _metrohash_ to get URL fingerprint by default

## v0.2.0 (Canary)

### FEATURES

- Increase the default timeout of `Scraper` request from 1s to 10s

### PATCHES

- HTTP proxies won't work with HTTPS websites

## v0.1.1 (Canary)

### PATCHES

- Entities not exported

## v0.1.0 (Canary)

### FEATURES

- Add 3 main components: `Scheduler` as the manager, `Scraper` and `DataProcessor` as agents
