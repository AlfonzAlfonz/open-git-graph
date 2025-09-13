import { DeleteBranchOptions } from "../git/commands/gitBranchDelete";
import {
	gitPushDelete,
	PushDeleteOptions,
} from "../git/commands/gitPushDelete";
import { formatArgs, showCommandBuilder } from "./utils";

export const getDeleteRemoteBranchOptions = async (
	origin: string,
	branches: string[],
	initialValue?: PushDeleteOptions,
): Promise<DeleteBranchOptions | undefined> => {
	const selected = await showCommandBuilder({
		getPlaceholder: (o) => formatArgs(gitPushDelete(origin, branches, o)),
		initialValue,
		items: {
			force: {
				label: "--force",
				type: "flag",
				description: "Delete branch even if it can lead to lost commits",
			},
		},
	});

	return selected;
};
