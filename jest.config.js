/* eslint-disable @typescript-eslint/naming-convention */
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	testEnvironment: "node",
	transform: {},
	extensionsToTreatAsEsm: [".ts", ".tsx"],
	testPathIgnorePatterns: ["/node_modules/", "_utils.test.ts"],
	collectCoverage: true,
	collectCoverageFrom: ["./src/**"],
	coveragePathIgnorePatterns: [
		"/node_modules/",
		"/src/runtime/store/vscode.git",
	],
	transform: {
		"^.+\\.tsx?$": ["ts-jest", { useESM: true, isolatedModules: true }],
	},
};
