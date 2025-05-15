import { $ } from "zx";
import { getFixtureRepoPath } from "../../../../../test/_utils.test";
import { fs } from "zx";

export const setupRepoFixture = async (
	repo: string,
	branch: string = "main",
) => {
	$.cwd = getFixtureRepoPath(repo);
	const gitPath = "git";

	await $`git switch --force-create ${branch} ${"origin/" + branch}`;

	return {
		gitPath,
		repoPath: $.cwd,
	};
};
