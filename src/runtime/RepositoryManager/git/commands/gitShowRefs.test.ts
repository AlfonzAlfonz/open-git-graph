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

		const refs = await gitShowRefs().parse(Readable.from(input));

		expect([...refs]).toEqual([
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

	test("mixed tags", async () => {
		const input = [
			"6ba5e293d2e81e7f703d081bf2957ab6bae41c63 refs/tags/v15.6.1",
			"ea49c1d4976359c6754d47f94534289e8fe5f3ef refs/tags/v15.6.1^{}",
			"af7ecd35e76e5204a11fa496ad2d6b604dd858f3 refs/tags/v15.6.2",
			"3d4db18ca9bcb45bdad640e697e3f3e06270dbe2 refs/tags/v15.6.2^{}",
			"6668c97331cb9e02f29a8610e85305d3ee4b19fa refs/tags/v15.6.3",
			"4711075d2f2abb266400ed33a6ccab5313224b34 refs/tags/v15.6.3^{}",
			"9b6ce38dc16df81b7e361d995c73e46f5334d7dc refs/tags/v15.7.0",
			"18356f26cd7f9a129b33e5f441bbc988df33fdd5 refs/tags/v15.8.0",
			"30d840c10e8f783226c0b2a5eaeb651f9bd39bf4 refs/tags/v15.9.0",
		].join("\n");

		const refs = await gitShowRefs().parse(Readable.from(input));

		expect([...refs].map((r) => r.type === "tag" && [r.hash, r.name])).toEqual([
			["ea49c1d4976359c6754d47f94534289e8fe5f3ef", "v15.6.1"],
			["3d4db18ca9bcb45bdad640e697e3f3e06270dbe2", "v15.6.2"],
			["4711075d2f2abb266400ed33a6ccab5313224b34", "v15.6.3"],
			["9b6ce38dc16df81b7e361d995c73e46f5334d7dc", "v15.7.0"],
			["18356f26cd7f9a129b33e5f441bbc988df33fdd5", "v15.8.0"],
			["30d840c10e8f783226c0b2a5eaeb651f9bd39bf4", "v15.9.0"],
		]);
	});
});
