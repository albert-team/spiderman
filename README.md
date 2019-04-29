[![](https://img.shields.io/github/license/albert-team/spiderman.svg?style=flat-square)](https://github.com/albert-team/spiderman)
[![](https://img.shields.io/npm/v/@albert-team/spiderman/latest.svg?style=flat-square)](https://www.npmjs.com/package/@albert-team/spiderman)

# SPIDERMAN

> Minimalistic web crawler for Node.js

## Installation

### Requirements

#### Mandatory

- Node.js >= 8.0.0

#### Optional

- Redis >= 4.0 with RedisBloom >= 1.1.0

### Instructions

- With npm:

```bash
npm i @albert-team/spiderman
```

- With yarn:

```bash
yarn add @albert-team/spiderman
```

## Usage

### Quick Start

```js
const { Scheduler, Scraper, DataProcessor } = require('@albert-team/spiderman')

class MyScraper extends Scraper {
  constructor() {
    super()
  }

  async parse(html) {
    return { data: { html }, nextUrls: [] }
  }
}

class MyDataProcessor extends DataProcessor {
  constructor() {
    super()
  }

  async run(data) {
    console.log(data)
    return { success: true }
  }
}

class MyManager extends Scheduler {
  constructor() {
    super('url')
  }

  classifyUrl(url) {
    return {
      scraper: new MyScraper(),
      dataProcessor: new MyDataProcessor()
    }
  }
}

const manager = new MyManager()
manager.once('idle', async () => {
  await manager.stop()
  manager.disconnect()
})
manager.start()
```

### Examples

A working example can be found [here](https://github.com/albert-team/spiderman/blob/master/tests/index.js).

## Changelog

Read more [here](https://github.com/albert-team/spiderman/blob/master/CHANGELOG.md).

## Todo

Read more [here](https://github.com/albert-team/spiderman/blob/master/TODO.md).
