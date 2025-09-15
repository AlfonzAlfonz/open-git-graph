import { gitCheckout } from "../git/commands/gitCheckout";
import { formatArgs, showCommandBuilder } from "./utils";

type CheckoutOtherOptions = {
	pull?: boolean;
	reset?: boolean;
};

export const getCheckoutOptions = async (
	branch: string,
): Promise<CheckoutOtherOptions | undefined> => {
	const selected = await showCommandBuilder({
		getPlaceholder: () => formatArgs(gitCheckout(branch)),
		items: {
			pull: {
				label: "Pull",
				detail: "Run `git pull` to pull changes from tracking branch",
				radioGroup: "checkout",
				type: "other",
			},
			reset: {
				label: "Reset",
				detail: "Run `git reset --hard` to reset local branch",
				radioGroup: "checkout",
				type: "other",
			},
		},
	});

	return selected;
};
