import { RebaseOptions } from "../git/commands/gitRebase";
import { showCommandBuilder } from "./utils";

export const getRebaseOptions = async (
	upstream: string,
	initialValue?: Partial<RebaseOptions>,
) => {
	const result = await showCommandBuilder({
		getPlaceholder: (flags) => `git rebase ${flags.join(" ")} ${upstream}`,
		initialValue,
		items: {
			interactive: {
				label: "--interactive",
				type: "flag",
				description: "Lets you edit list of commits before rebase",
			},
			autosquash: {
				label: "--autosquash",
				type: "flag",
				description:
					"Automatically squash commits with specially formatted messages.",
			},
		},
	});

	return result;
};
