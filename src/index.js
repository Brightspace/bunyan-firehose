'use strict';

const FirehoseStream = require('./firehoseStream');

const createStream = (...args) => {
	return new FirehoseStream(...args);
};

module.exports = {
	createStream
};
