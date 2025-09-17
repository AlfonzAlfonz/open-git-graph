import { gitPush, PushOptions } from "../git/commands/gitPush";
import { formatArgs, showCommandBuilder } from "./utils";

export const getPushOptions = async (
	remote: string,
	refspec: string | string,
	initialValue?: PushOptions,
): Promise<PushOptions | undefined> => {
	const selected = await showCommandBuilder<PushOptions>({
		getPlaceholder: (o) => formatArgs(gitPush(remote, refspec, o)),
		initialValue,
		items: {
			forceWithLease: {
				label: "--force-with-lease",
				type: "flag",
				radioGroup: "force",
				description:
					"Safer option than --force, which prevents overwriting commits, which were added to the remote",
			},
			force: {
				label: "--force",
				type: "flag",
				radioGroup: "force",
				description: "Delete branch even if it can lead to lost commits",
			},
		},
	});

	return selected;
};
