[![](https://img.shields.io/github/license/albert-team/spiderman.svg?style=flat-square)](https://github.com/albert-team/spiderman)
[![](https://img.shields.io/npm/v/@albert-team/spiderman.svg?style=flat-square)](https://www.npmjs.com/package/@albert-team/spiderman)
[![](https://img.shields.io/travis/com/albert-team/spiderman.svg?style=flat-square)](https://travis-ci.com/albert-team/spiderman)

# Spiderman

> Minimalistic web crawler for Node.js

## INSTALLATION

### Requirements

#### Mandatory

- Node.js >= 10

#### Optional

- Redis >= 4.0 with RedisBloom >= 2.2.0

### Instructions

- With npm:

```bash
npm i @albert-team/spiderman
```

- With yarn:

```bash
yarn add @albert-team/spiderman
```

## USAGE

### Quick Start

```js
const {
  Scheduler,
  Scraper,
  DataProcessor,
  UrlEntity,
  DataEntity,
} = require('@albert-team/spiderman')

class MyManager extends Scheduler {
  constructor() {
    super('url')
  }

  classifyUrl(url) {
    return new UrlEntity(url, new MyScraper())
  }

  classifyData(data) {
    return new DataEntity(data, new MyDataProcessor())
  }
}

class MyScraper extends Scraper {
  constructor() {
    super()
  }

  async parse(resBody) {
    return { data: {}, nextUrls: [] }
  }
}

class MyDataProcessor extends DataProcessor {
  constructor() {
    super()
  }

  async process(data) {
    return { success: true }
  }
}

const manager = new MyManager()
manager.once('idle', async () => {
  await manager.stop()
  manager.disconnect()
})
manager.start(['https://github.com/albert-team/spiderman'])
```

### Examples

See [here](https://github.com/albert-team/spiderman/blob/master/examples).

### API

Read more [here](https://albert-team.github.io/spiderman).

## Changelog

Read more [here](https://github.com/albert-team/spiderman/blob/master/CHANGELOG.md).

## Todo

Read more [here](https://github.com/albert-team/spiderman/blob/master/TODO.md).
