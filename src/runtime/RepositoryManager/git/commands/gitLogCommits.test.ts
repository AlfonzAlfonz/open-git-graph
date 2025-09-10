import { collect } from "@alfonz/async/collect";
import { execGit } from "../execGit";
import { setupRepoFixture } from "./_utils.test";
import { gitLogCommits } from "./gitLogCommits";
import { take } from "../../../utils";

describe("gitLogCommits", () => {
	test("simple", async () => {
		const { gitPath, repoPath } = await setupRepoFixture("simple-history");

		const command = gitLogCommits();

		const result = execGit(command, gitPath, repoPath, (e) => {
			throw e;
		});

		const subjects = [];
		for await (const l of result) {
			subjects.push(l.subject);
		}

		expect(subjects).toMatchObject([
			"remove crapy file",
			"add crapy file",
			"add another file",
			"add more info",
			"init commit",
		]);
	});

	test("with take", async () => {
		const { gitPath, repoPath } = await setupRepoFixture("simple-history");

		const command = gitLogCommits();

		const result = execGit(command, gitPath, repoPath, (e) => {
			throw e;
		});

		const subjects = await collect(take(result[Symbol.asyncIterator](), 20));

		expect(subjects).toHaveLength(5);
	});
});
