import { DeleteBranchOptions } from "../git/commands/gitBranchDelete";
import { showCommandBuilder } from "./utils";

export const getDeleteBranchOptions = async (
	branch: string,
	initialValue?: DeleteBranchOptions & { remotes?: boolean },
): Promise<(DeleteBranchOptions & { remotes: boolean }) | undefined> => {
	const selected = await showCommandBuilder({
		getPlaceholder: (flags) => `git branch -d ${flags.join(" ")} ${branch}`,
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
