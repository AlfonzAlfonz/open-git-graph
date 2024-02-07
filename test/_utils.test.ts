import { resolve } from "path";

export const getProjectRoot = () => {
	const { pathname } = new URL(import.meta.url);
	return resolve(pathname, "../..");
};

export const getFixtureRepoPath = (repo: string) => {
	return resolve(getProjectRoot(), "test/fixtures/", repo);
};
