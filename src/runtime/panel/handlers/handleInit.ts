import { InitMessage } from "../../../types/messages";
import { req } from "../../../types/req";
import { GitRepository } from "../../git/GitRepository";
import { batch, buffer } from "../../utils";
import { Handler } from "../types";

export const handleInit: Handler<InitMessage> = async (_, getState) => {
	await getState(async (state) => {
		const git = new GitRepository(state, state.panelRepository);

		const dispatchCommits = async () => {
			for await (const commits of batch(git.getCommits())) {
				await state.sendMessage({
					type: "APPEND_COMMITS",
					commits: req.done(commits),
				});
			}
		};

		const dispatchRefs = async () => {
			const refs = await buffer(git.getRefs());
			await state.sendMessage({
				type: "GET_REFS",
				refs: req.done(refs),
			});
		};

		await Promise.all([dispatchCommits(), dispatchRefs()]);
	});
};
