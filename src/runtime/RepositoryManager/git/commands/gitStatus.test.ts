import { Readable } from "stream";
import { gitStatus } from "./gitStatus";

describe("gitStatus", () => {
	test("should work", async () => {
		const input = [
			"## alfonz/actions",
			" M src/runtime/RepositoryManager/RepositoryStateHandle.ts",
			"M  src/runtime/RepositoryManager/git/commands/gitStatus.ts",
			" M src/universal/protocol/index.ts",
		].join("\n");

		const status = await gitStatus().parse(Readable.from(input));

		expect(status.branch).toEqual("alfonz/actions");
		expect(status.tracked).toEqual([
			{
				mode: "M",
				path: "src/runtime/RepositoryManager/git/commands/gitStatus.ts",
			},
		]);
		expect(status.untracked).toEqual([
			{
				mode: "M",
				path: "src/runtime/RepositoryManager/RepositoryStateHandle.ts",
			},
			{ mode: "M", path: "src/universal/protocol/index.ts" },
		]);
	});

	test("detached head", async () => {
		const input = ["## HEAD (no branch)"].join("\n");

		const status = await gitStatus().parse(Readable.from(input));

		expect(status.branch).toEqual(undefined);
		expect(status.tracked).toEqual([]);
		expect(status.untracked).toEqual([]);
	});

	test("head behind", async () => {
		const input = ["## master...origin/master [behind 16]"].join("\n");

		const status = await gitStatus().parse(Readable.from(input));

		expect(status.branch).toEqual("master");
		expect(status.tracked).toEqual([]);
		expect(status.untracked).toEqual([]);
	});
});
