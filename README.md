# Bunyan Firehose

[![License][License Badge]](LICENSE)
[![Version][Version Badge]](package.json#L3)
[![Build][CI Badge]][CI Workflow]
[![Coverage][Coverage Badge]][Coverage Report]
[![Vulnerabilities][Vulnerabilities Badge]][Vulnerabilities Report]

AWS Firehose extension for the Bunyan logger.

## Table of Contents

* [Installing](#installing)
* [Usage](#usage)
* [Development](#development)
	* [Building](#building)
	* [Testing](#testing)
	* [Formatting](#formatting)

## Installing

```bash
npm i github:Brightspace/bunyan-firehose
```

## Usage

```javascript
'use strict';

const bunyan = require('bunyan');
const bunyanFirehose = require('bunyan-firehose');
const AWS = require('aws-sdk');

const config = {
	streamName: 'logs-stream',
	region: 'us-east-1',
	credentials: new AWS.Credentials({
		accessKeyId: '<ACCESS_KEY_ID>',
		secretAccessKey: '<SECRET_ACCESS_KEY>',
		sessionToken: '<SESSION_TOKEN>'
	})
};

const createLogger = (name) => {
	if (!name) {
		throw new Error('Missing \'name\' in config');
	}

	const stream = bunyanFirehose.createStream(config);

	stream.on('error', (err) => console.error('Firehose log error: ', err));

	const loggerConfig = {
		name,
		level: 'info',
		serializers: bunyan.stdSerializers,
		streams: [
			{ stream: process.stdout, level: 'info' },
			{ stream, type: 'raw' }
		]
	};

	return bunyan.createLogger(loggerConfig);
};

(() => {
	const logger = createLogger('Firehose Demo App');
	const msg = 'Well hello there, firehose!';
	const data = { demo: 'data' };

	logger.info({ msg, data });
	logger.info('Simple strings are converted to objects in bunyan');
	logger.warn('This is a warning');
})();
```

## Development

Development can be done on any machine that can install **Node.js**.

### Building

Install dependencies via `npm`.

```bash
npm i
```

### Testing

Execute tests via `npm`.

```bash
npm test
```

This will run lint, license and unit tests. You will also be presented a basic
coverage report after test execution.

### Formatting

Execute formatter via `npm`.

```bash
npm run format
```

This will format based on [.eslintrc](.eslintrc) settings.

<!-- links -->
[License Badge]: https://img.shields.io/github/license/Brightspace/bunyan-firehose
[Version Badge]: https://img.shields.io/github/package-json/v/Brightspace/bunyan-firehose
[CI Badge]: https://github.com/Brightspace/bunyan-firehose/workflows/build/badge.svg?branch=master
[CI Workflow]: https://github.com/Brightspace/bunyan-firehose/actions?query=workflow%3Abuild+branch%3Amaster
[Coverage Badge]: https://coveralls.io/repos/github/Brightspace/bunyan-firehose/badge.svg?branch=master
[Coverage Report]: https://coveralls.io/github/Brightspace/bunyan-firehose?branch=master
[Vulnerabilities Badge]: https://snyk.io/test/github/Brightspace/bunyan-firehose/badge.svg
[Vulnerabilities Report]: https://snyk.io/test/github/Brightspace/bunyan-firehose
