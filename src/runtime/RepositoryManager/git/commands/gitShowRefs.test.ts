import { Readable } from "stream";
import { gitShowRefs } from "./gitShowRefs";
import { collect } from "@alfonz/async/collect";

describe("gitShowRefs", () => {
	test("should work", async () => {
		const input = [
			"bb56f269ff11efca520d5d1cf571804e9b7e7302 HEAD",
			"bb56f269ff11efca520d5d1cf571804e9b7e7302 refs/heads/alfonz/actions",
			"c23c8b01a37962f9a68fa09ed9b8ce1430e59d9f refs/heads/alfonz/ci",
			"3e41175b337b38927336f135eb850e02575f48f6 refs/heads/asxnc",
			"421ebc20daedb6b88dcae84de0ff3a9c7ef85ee8 refs/heads/feat/github-ci",
			"bb56f269ff11efca520d5d1cf571804e9b7e7302 refs/heads/main",
			"22c1e74e005cb67fa2339ac5cf3ea29ebbfcfcac refs/heads/move",
			"e94685eb670e9d6ffdaf69d2c1c6ab1ff2028d06 refs/heads/search",
			"d7c2929f1e67d843c66604ab3a0b46c40d103e82 refs/heads/x",
			"5b4278c0407d184b02b2ef52a9ea9a5ce6bb42da refs/heads/y",
			"c23c8b01a37962f9a68fa09ed9b8ce1430e59d9f refs/remotes/origin/alfonz/ci",
			"1dff5431c26874bd5425102f94f861567c1a9d3d refs/remotes/origin/asxnc",
			"421ebc20daedb6b88dcae84de0ff3a9c7ef85ee8 refs/remotes/origin/feat/github-ci",
			"bb56f269ff11efca520d5d1cf571804e9b7e7302 refs/remotes/origin/main",
			"ed8fb9be983a5d21f5279f49231b1fb18fc1956e refs/remotes/origin/move",
			"0c1936d4556354a4349aee9bf16a274e40c71a6f refs/stash",
		].join("\n");

		const refs = await collect(gitShowRefs().parse(Readable.from(input)));

		expect(refs).toEqual([
			{
				hash: "bb56f269ff11efca520d5d1cf571804e9b7e7302",
				type: "head",
			},
			{
				hash: "bb56f269ff11efca520d5d1cf571804e9b7e7302",
				name: "alfonz/actions",
				type: "branch",
			},
			{
				hash: "c23c8b01a37962f9a68fa09ed9b8ce1430e59d9f",
				name: "alfonz/ci",
				type: "branch",
			},
			{
				hash: "3e41175b337b38927336f135eb850e02575f48f6",
				name: "asxnc",
				type: "branch",
			},
			{
				hash: "421ebc20daedb6b88dcae84de0ff3a9c7ef85ee8",
				name: "feat/github-ci",
				type: "branch",
			},
			{
				hash: "bb56f269ff11efca520d5d1cf571804e9b7e7302",
				name: "main",
				type: "branch",
			},
			{
				hash: "22c1e74e005cb67fa2339ac5cf3ea29ebbfcfcac",
				name: "move",
				type: "branch",
			},
			{
				hash: "e94685eb670e9d6ffdaf69d2c1c6ab1ff2028d06",
				name: "search",
				type: "branch",
			},
			{
				hash: "d7c2929f1e67d843c66604ab3a0b46c40d103e82",
				name: "x",
				type: "branch",
			},
			{
				hash: "5b4278c0407d184b02b2ef52a9ea9a5ce6bb42da",
				name: "y",
				type: "branch",
			},
			{
				hash: "c23c8b01a37962f9a68fa09ed9b8ce1430e59d9f",
				name: "alfonz/ci",
				remote: "origin",
				type: "branch",
			},
			{
				hash: "1dff5431c26874bd5425102f94f861567c1a9d3d",
				name: "asxnc",
				remote: "origin",
				type: "branch",
			},
			{
				hash: "421ebc20daedb6b88dcae84de0ff3a9c7ef85ee8",
				name: "feat/github-ci",
				remote: "origin",
				type: "branch",
			},
			{
				hash: "bb56f269ff11efca520d5d1cf571804e9b7e7302",
				name: "main",
				remote: "origin",
				type: "branch",
			},
			{
				hash: "ed8fb9be983a5d21f5279f49231b1fb18fc1956e",
				name: "move",
				remote: "origin",
				type: "branch",
			},
		]);
	});
});
