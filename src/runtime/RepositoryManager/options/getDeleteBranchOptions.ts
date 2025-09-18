import {
	DeleteBranchOptions,
	gitBranchDelete,
} from "../git/commands/gitBranchDelete";
import { formatArgs, showCommandBuilder } from "./utils";

export const getDeleteBranchOptions = async (
	branch: string,
	initialValue?: DeleteBranchOptions & { remotes?: boolean },
): Promise<(DeleteBranchOptions & { remotes: boolean }) | undefined> => {
	const selected = await showCommandBuilder<
		DeleteBranchOptions & { remotes: boolean }
	>({
		getPlaceholder: (o) => formatArgs(gitBranchDelete(branch, o)),
		initialValue,
		items: {
			force: {
				label: "--force",
				type: "flag",
				description: "Delete branch even if it can lead to lost commits",
			},
			remotes: {
				label: "Remove tracking branches",
				type: "other",
				detail: "Run `git push -d` to remove tracking branches",
			},
		},
	});

	return selected;
};
