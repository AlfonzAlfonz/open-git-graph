import { GitRef } from "../../universal/git";
import { toGraphBadges } from "./toGraphBadges";

describe("toGraphBadges", () => {
	test("should work", () => {
		const input: Iterable<[string, GitRef[]]> = [
			[
				"a9c432b8ef1f6ed3d70f41b8de7158a86faca325",
				[
					{ hash: "a9c432b8ef1f6ed3d70f41b8de7158a86faca325", type: "head" },
					{
						hash: "a9c432b8ef1f6ed3d70f41b8de7158a86faca325",
						type: "branch",
						fullname: "refs/heads/master",
						name: "master",
					},
					{
						hash: "a9c432b8ef1f6ed3d70f41b8de7158a86faca325",
						type: "branch",
						fullname: "refs/heads/x",
						name: "x",
					},
					{
						hash: "a9c432b8ef1f6ed3d70f41b8de7158a86faca325",
						type: "branch",
						name: "HEAD",
						remote: "origin",
						fullname: "refs/remotes/origin/HEAD",
					},
					{
						hash: "a9c432b8ef1f6ed3d70f41b8de7158a86faca325",
						type: "branch",
						name: "master",
						remote: "origin",
						fullname: "refs/remotes/origin/master",
					},
					{
						hash: "a9c432b8ef1f6ed3d70f41b8de7158a86faca325",
						type: "tag",
						name: "v17.0.0",
						fullname: "refs/tags/v17.0.0",
					},
				],
			],
			[
				"5ef678a3b92732a925991febfcacce978e12d611",
				[
					{
						hash: "5ef678a3b92732a925991febfcacce978e12d611",
						type: "branch",
						name: "add-action-telemetry",
						remote: "origin",
						fullname: "refs/remotes/origin/add-action-telemetry",
					},
				],
			],
			[
				"d3e2e7ab48c95c8241ded8a2990ae836bade610c",
				[
					{
						hash: "d3e2e7ab48c95c8241ded8a2990ae836bade610c",
						type: "branch",
						name: "ales/cpu-ram-monitoring",
						remote: "origin",
						fullname: "refs/remotes/origin/cpu-ram-monitoring",
					},
				],
			],
			[
				"50eb84178881e651cd9ada6e8160341f7c96c162",
				[
					{
						hash: "50eb84178881e651cd9ada6e8160341f7c96c162",
						type: "branch",
						name: "an/addCustomTelemetry",
						remote: "origin",
						fullname: "refs/remotes/origin/addCustomTelemetry",
					},
				],
			],
			[
				"fb14b93b6b116af276f3655d2c56e2468a13d80c",
				[
					{
						hash: "fb14b93b6b116af276f3655d2c56e2468a13d80c",
						type: "tag",
						name: "v0.0.0",
						fullname: "refs/tags/v0.0.0",
					},
				],
			],
			[
				"8f35cc024c0224c53e3432c95c692e07873d4b62",
				[
					{
						hash: "8f35cc024c0224c53e3432c95c692e07873d4b62",
						type: "tag",
						name: "v0.0.0-mz-ci.1",
						fullname: "refs/tags/v0.0.0-mz-ci.1",
					},
				],
			],
			[
				"52560c39eca5f4c5d608a7d3fd3b88bce866781f",
				[
					{
						hash: "52560c39eca5f4c5d608a7d3fd3b88bce866781f",
						type: "tag",
						name: "v1.0.0",
						fullname: "refs/tags/v1.0.0",
					},
				],
			],
			[
				"f1b7bdc550469ad74b17764811540be9e0381224",
				[
					{
						hash: "f1b7bdc550469ad74b17764811540be9e0381224",
						type: "tag",
						name: "v10.0.0",
						fullname: "refs/tags/v10.0.0",
					},
				],
			],
			[
				"0b1843a71657ce37155772f8869b6da0e5d22380",
				[
					{
						hash: "0b1843a71657ce37155772f8869b6da0e5d22380",
						type: "tag",
						name: "v10.0.1",
						fullname: "refs/tags/v10.0.1",
					},
				],
			],
		];

		const badges = Object.fromEntries(toGraphBadges(input));

		expect(badges["a9c432b8ef1f6ed3d70f41b8de7158a86faca325"]).toHaveLength(5);
		expect(badges["a9c432b8ef1f6ed3d70f41b8de7158a86faca325"]![0]).toEqual({
			type: "branch",
			label: "master",
			endDecorators: ["origin"],
		});
		expect(badges["a9c432b8ef1f6ed3d70f41b8de7158a86faca325"]![1]).toEqual({
			type: "branch",
			label: "x",
			endDecorators: [],
		});

		expect(badges["5ef678a3b92732a925991febfcacce978e12d611"]).toEqual([
			{
				type: "branch",
				label: "origin/add-action-telemetry",
				remoteOnlyBranch: true,
			},
		]);
		expect(badges["fb14b93b6b116af276f3655d2c56e2468a13d80c"]).toEqual([
			{ type: "tag", label: "v0.0.0" },
		]);
	});
});
