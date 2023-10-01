import { CheckoutMessage } from "../../../universal/messages";
import { GitRepository } from "../../git/GitRepository";
import { Handler } from "../types";
import { handleRefresh } from "./handleRefresh";

export const handleCheckout: Handler<CheckoutMessage> = async (options) => {
	const { state, panelState, msg } = options;
	const git = new GitRepository(state, panelState.repoPath);

	await git.checkout(msg.branch);

	await handleRefresh(options);
};
