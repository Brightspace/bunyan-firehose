# Bunyan Firehose

AWS Firehose extension for the Bunyan logger

## Table of Contents

* [Installing](#installing)
* [Usage](#usage)
* [Development](#development)
	* [Building](#building)
	* [Testing](#testing)
	* [Formatting](#formatting)

## Installing

```
npm install github:Brightspace/bunyan-firehose
```

## Usage

```
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

```
npm i
```

### Testing

Execute tests via `npm`.

```
npm test
```

This will run lint, license and unit tests. You will also be presented a basic
coverage report after test execution.

### Formatting

Execute formatter via `npm`.

```
npm run format
```

This will format based on [.eslintrc](.eslintrc) settings.
