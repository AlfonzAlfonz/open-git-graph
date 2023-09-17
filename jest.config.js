/* eslint-disable @typescript-eslint/naming-convention */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: "ts-jest/presets/js-with-babel-esm",
	testEnvironment: "node",
	moduleNameMapper: {
		"(.*).js$": "$1",
	},
};
