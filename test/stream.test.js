import AWS from 'aws-sdk';
import { stdSerializers, createLogger } from 'bunyan';
import { createStream } from '../';
import deepmerge from 'deepmerge';
import { expect } from 'chai';
import { merge } from 'lodash';
import { createSandbox, match } from 'sinon';

const region = 'us-east-1';
const name = 'bunyan-firehose-logger';
const credentials = {
	accessKeyId: 'accessKeyId',
	secretAccessKey: 'secretAccessKey',
	sessionToken: 'sessionToken'
};
const streamCommonConfig = {
	streamName: 'bunyan-firehose-stream',
	region,
	buffer: { timeout: 0 }
};
const loggerCommonConfig = {
	name,
	level: 'trace',
	serializers: stdSerializers,
};

const createTestLogger = (loggerConfig) => {
	const logger = createLogger(loggerConfig);

	expect(logger).to.not.be.null;

	return logger;
};

const createTestStream = (streamConfig) => {
	const stream = createStream(streamConfig);

	expect(stream).to.not.be.null;

	return stream;
};

const checkRecord = (record, value) => {
	record = JSON.parse(record);

	expect(record.name).to.equal(name);
	expect(record.test).to.equal(value);
	expect(record.msg).to.equal(value);
};

describe('stream', () => {
	describe('create', () => {
		it('without parameters', () => {
			createTestStream({});
		});

		it('with partition key', () => {
			const partitionKey = 'test';
			const stream = createTestStream({ partitionKey });

			expect(stream.partitionKey).to.equal(partitionKey);
		});
	});

	describe('will log', () => {
		let sandbox;
		let credentialsStub;
		let firehoseStub;

		beforeEach(() => {
			sandbox = createSandbox();
			credentialsStub = sandbox
				.stub(AWS, 'Credentials')
				.returns(credentials);
		});

		afterEach(() => {
			sandbox.assert.calledOnce(credentialsStub);
			sandbox.assert.calledWith(credentialsStub, credentials);
			sandbox.assert.calledOnce(firehoseStub);
			sandbox.assert.calledWith(
				firehoseStub,
				{
					region,
					httpOptions: match.any,
					credentials
				}
			);
			sandbox.restore();
		});

		it('single', () => {
			let capturedInput;

			firehoseStub = sandbox
				.stub(AWS, 'Firehose')
				.returns({
					putRecordBatch: input => {
						capturedInput = input.Records[0].Data;

						return { on: () => { } };
					}
				});

			const streamConfig = deepmerge(
				streamCommonConfig,
				{
					credentials: new AWS.Credentials(credentials),
					buffer: { length: 1 }
				}
			);
			const stream = createTestStream(streamConfig);
			const loggerConfig = merge(
				loggerCommonConfig,
				{ streams: [{ stream, type: 'raw' }] }
			);
			const logger = createTestLogger(loggerConfig);
			const test = 'trace';

			logger.trace({ test }, test);
			expect(capturedInput).to.be.a('string').that.is.not.empty;
			checkRecord(capturedInput, test);
		});

		it('multiple', () => {
			let capturedInput;

			firehoseStub = sandbox
				.stub(AWS, 'Firehose')
				.returns({
					putRecordBatch: input => {
						capturedInput = [
							input.Records[0].Data,
							input.Records[1].Data,
							input.Records[2].Data
						];

						return { on: () => { } };
					}
				});

			const streamConfig = deepmerge(
				streamCommonConfig,
				{
					credentials: new AWS.Credentials(credentials),
					buffer: { length: 3 }
				}
			);
			const stream = createTestStream(streamConfig);
			const loggerConfig = merge(
				loggerCommonConfig,
				{ streams: [{ stream, type: 'raw' }] }
			);
			const logger = createTestLogger(loggerConfig);
			const test1 = 'info';
			const test2 = 'trace';
			const test3 = 'error';

			logger.info({ test: test1 }, test1);
			logger.trace({ test: test2 }, test2);
			logger.error({ test: test3 }, test3);

			expect(capturedInput).to.be.an('array').that.is.lengthOf(3);
			checkRecord(capturedInput[0], test1);
			checkRecord(capturedInput[1], test2);
			checkRecord(capturedInput[2], test3);
		});
	});
});
