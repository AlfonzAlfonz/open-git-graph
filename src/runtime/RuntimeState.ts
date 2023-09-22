import { FromRuntimeMessage, FromWebviewMessage } from "../types/messages";
import { GitCommands } from "./git/GitCommands.js";
import { execGit } from "./git/execGit.js";
import { batch, buffer } from "./utils.js";

export class RuntimeState {
	constructor(
		private dispatch: (msg: FromRuntimeMessage) => Thenable<unknown>,
	) {}

	public async receive(msg: FromWebviewMessage) {
		try {
			switch (msg.type) {
				case "INIT":
					this.init();
					break;
				default: {
					msg.type satisfies never;
				}
			}
		} catch (e) {
			console.error(e);
		}
	}

	private async init() {
		const dispatchCommits = async () => {
			for await (const commits of batch(execGit(GitCommands.getCommits()))) {
				await this.dispatch({
					type: "APPEND_COMMITS",
					commits,
				});
			}
		};

		const dispatchRefs = async () => {
			const refs = await buffer(execGit(GitCommands.getRefs()));
			await this.dispatch({
				type: "GET_REFS",
				refs,
			});
		};

		await Promise.allSettled([
			dispatchCommits().catch((e) => console.error(e)),
			dispatchRefs().catch((e) => console.error(e)),
		]);
	}
}
