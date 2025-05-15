import { execGit } from "../execGit";
import { setupRepoFixture } from "./_utils.test";
import { gitCheckout } from "./gitCheckout";

describe("gitLogCommits", () => {
	test("simple", async () => {
		const { gitPath, repoPath } = await setupRepoFixture("linear-history");

		const command = gitCheckout("feat/more-text");

		expect(
			execGit(command, gitPath, repoPath, (e) => {
				throw e;
			}),
		).resolves.toBe(undefined);
	});
});
