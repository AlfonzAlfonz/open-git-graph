import { gitRebase, RebaseOptions } from "../git/commands/gitRebase";
import { formatArgs, showCommandBuilder } from "./utils";

export const getRebaseOptions = async (
	upstream: string,
	initialValue?: Partial<RebaseOptions>,
) => {
	const result = await showCommandBuilder({
		getPlaceholder: (o) => formatArgs(gitRebase(upstream, o)),
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
