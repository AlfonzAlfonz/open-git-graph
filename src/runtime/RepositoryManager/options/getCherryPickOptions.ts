import {
	CherryPickOptions,
	gitCherryPick,
} from "../git/commands/gitCherryPick";
import { formatArgs, showCommandBuilder } from "./utils";

export const getCherryPickOptions = async (
	commit: string,
	initialValue?: CherryPickOptions,
): Promise<CherryPickOptions | undefined> => {
	const selected = await showCommandBuilder<CherryPickOptions>({
		getPlaceholder: (o) => formatArgs(gitCherryPick(commit, o)),
		initialValue,
		items: {
			noCommit: {
				label: "--no-commit",
				type: "flag",
				description: "Apply changes, but do not commit.",
			},
			recordOrigin: {
				label: "-x",
				type: "flag",
				description: "Record origin commit of the cherry pick.",
			},
			edit: {
				label: "--edit",
				type: "flag",
				description: "Edit commit message before committing.",
			},
		},
	});

	return selected;
};
