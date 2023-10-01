import { InitMessage } from "../../../universal/messages.js";
import { req } from "../../../universal/req.js";
import { GitRepository } from "../../git/GitRepository.js";
import { batch, buffer } from "../../utils.js";
import { Handler } from "../types.js";
import { msg } from "./utils.js";

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

			if (first) {
				const payload = {
					index: await git.getIndex(),
					commits: commits.value,
				};
				await panel.webview.postMessage(
					msg({
						type: "SET_COMMITS",
						commits: commits.done ? req.done(payload) : req.waiting(payload),
					}),
				);
				first = false;
			} else {
				await panel.webview.postMessage(
					msg({
						type: "APPEND_COMMITS",
						commits: commits.done
							? req.done(commits.value)
							: req.waiting(commits.value),
					}),
				);
			}

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
