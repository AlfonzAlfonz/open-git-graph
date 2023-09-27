import { RefreshMessage } from "../../../types/messages";
import { req } from "../../../types/req";
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
		const commits = await buffer(git.getCommits());

		await panel.webview.postMessage(
			msg({
				type: "SET_COMMITS",
				commits: req.done(commits),
			}),
		);
	};

	const dispatchRefs = async () => {
		const refs = await buffer(git.getRefs());
		await panel.webview.postMessage(
			msg({
				type: "GET_REFS",
				refs: req.done(refs),
			}),
		);
	};

	await Promise.all([dispatchCommits(), dispatchRefs()]);
};
