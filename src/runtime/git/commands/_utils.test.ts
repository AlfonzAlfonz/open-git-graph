import { $ } from "zx";
import { getFixtureRepoPath } from "../../../../test/_utils.test";

export const setupRepoFixture = async (
	repo: string,
	branch: string = "main",
) => {
	$.cwd = getFixtureRepoPath(repo);
	const gitPath = (await $`which git`).stdout.trim();

	await $`git switch --force-create ${branch} ${"origin/" + branch}`;

	return {
		gitPath,
		repoPath: $.cwd,
	};
};
