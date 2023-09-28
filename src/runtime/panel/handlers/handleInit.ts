import { InitMessage } from "../../../types/messages";
import { req } from "../../../types/req";
import { GitRepository } from "../../git/GitRepository";
import { batch, buffer } from "../../utils";
import { Handler } from "../types";
import { msg } from "./utils";

export const handleInit: Handler<InitMessage> = async ({
	panel,
	state,
	panelState,
}) => {
	const git = new GitRepository(state, panelState.repoPath);

	const dispatchCommits = async () => {
		let first = true;

		const log = await git.getCommits();

		panel.webview.postMessage(
			msg({ type: "SET_STASHES", stashes: req.done(log.stashes) }),
		);

		const batched = batch(log.commits);

		while (true) {
			const commits = await batched.next();

			await panel.webview.postMessage(
				msg({
					type: first ? "SET_COMMITS" : "APPEND_COMMITS",
					commits: commits.done
						? req.done(commits.value)
						: req.waiting(commits.value),
				}),
			);
			first = false;
			if (commits.done) break;
		}
	};

	const dispatchRefs = async () => {
		const refs = await buffer(git.getRefs());
		await panel.webview.postMessage(
			msg({
				type: "SET_REFS",
				refs: req.done(refs),
			}),
		);
	};

	await Promise.all([dispatchCommits(), dispatchRefs()]);
};
