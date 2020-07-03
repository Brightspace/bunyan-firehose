'use strict';

const { createStream } = require('../');
const { expect } = require('chai');

describe('create stream', () => {
	it('empty parameters', () => {
		const stream = createStream({});

		expect(stream).to.not.be.null;
	});
});
