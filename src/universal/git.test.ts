import { getPrefixedId } from "./git";

describe("getPrefixedId", () => {
	test("local branches", () => {
		const input = [
			"refs/heads/alfonz/actions",
			"refs/heads/alfonz/ci",
			"refs/heads/x",
			"refs/heads/y",
		];

		expect(input.map((x) => getPrefixedId("refs/heads/", x))).toEqual([
			"refs/heads/alfonz/actions",
			"refs/heads/alfonz/ci",
			"refs/heads/x",
			"refs/heads/y",
		]);
	});

	test("remote branches", () => {
		const input = [
			"refs/remotes/origin/alfonz/ci",
			"refs/remotes/origin/asxnc",
			"refs/remotes/origin/feat/github-ci",
			"refs/remotes/origin/main",
			"refs/remotes/origin/move",
		];

		expect(input.map((x) => getPrefixedId("refs/remotes/", x))).toEqual([
			"refs/remotes/origin/alfonz/ci",
			"refs/remotes/origin/asxnc",
			"refs/remotes/origin/feat/github-ci",
			"refs/remotes/origin/main",
			"refs/remotes/origin/move",
		]);
	});

	test("tags", () => {
		const input = [
			"refs/tags/v15.6.1",
			"refs/tags/v15.6.1^{}",
			"refs/tags/v15.6.2",
			"refs/tags/v15.6.2^{}",
			"refs/tags/v15.6.3",
			"refs/tags/v15.6.3^{}",
		];

		expect(input.map((x) => getPrefixedId("refs/tags/", x))).toEqual([
			"refs/tags/v15.6.1",
			"refs/tags/v15.6.1",
			"refs/tags/v15.6.2",
			"refs/tags/v15.6.2",
			"refs/tags/v15.6.3",
			"refs/tags/v15.6.3",
		]);
	});
});
