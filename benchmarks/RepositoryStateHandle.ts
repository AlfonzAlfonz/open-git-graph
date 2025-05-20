import { GitRepository } from "../src/runtime/RepositoryManager/git/GitRepository";
import { RepositoryStateHandle } from "../src/runtime/RepositoryManager/RepositoryStateHandle";
import { benchmark } from "./utils";

benchmark("RepositoryStateHandle", {
	maxAvgTime: 23,
	prepare: async () => {
		const uri = {
			fsPath: "/Users/denishomolik/projects/s/air-player/",
		};
		return new RepositoryStateHandle(
			new GitRepository(uri, {
				git: { path: "/opt/homebrew/bin/git" },
			} as never),
		);
	},
	run: async (handle) => {
		await handle.getGraphData();
	},
});
