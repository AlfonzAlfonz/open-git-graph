import { gitMerge, MergeOptions } from "../git/commands/gitMerge";
import { formatArgs, showCommandBuilder } from "./utils";

export const getMergeOptions = async (
	target: string,
	initialValue?: Partial<MergeOptions>,
) => {
	const result = await showCommandBuilder({
		getPlaceholder: (o) => formatArgs(gitMerge(target, o)),
		initialValue,
		items: {
			ff: {
				label: "--ff",
				type: "flag",
				description:
					"Fast-forward merge, do not create merge commit if possible",
			},
			noFf: {
				label: "--no-ff",
				type: "flag",
				description: "Always create merge commit",
			},
			ffOnly: {
				label: "--ff-only",
				type: "flag",
				description: "If fast-word merge is not possible, fail",
			},
		},
	});

	return result;
};
