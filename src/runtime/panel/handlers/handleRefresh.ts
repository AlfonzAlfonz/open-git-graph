import { RefreshMessage } from "../../../universal/messages";
import { req } from "../../../universal/req";
import { GitRepository } from "../../git/GitRepository";
import { buffer } from "../../utils";
import { Handler } from "../types";
import { msg } from "./utils";

export const handleRefresh: Handler<RefreshMessage> = async ({
	panel,
	state,
	panelState,
}) => {
	const git = new GitRepository(state, panelState.repoPath);

	const dispatchCommits = async () => {
		const log = await git.getCommits();
		const commits = await buffer(log.commits);

		await panel.webview.postMessage(
			msg({ type: "SET_STASHES", stashes: req.done(log.stashes) }),
		);

		await panel.webview.postMessage(
			msg({
				type: "SET_COMMITS",
				commits: req.done({
					index: await git.getIndex(),
					commits,
				}),
			}),
		);
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
