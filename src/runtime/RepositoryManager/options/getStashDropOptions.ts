import { gitStashDrop } from "../git/commands/gitStash";
import { formatArgs, showCommandBuilder } from "./utils";

export const getStashDropOptions = async (
	stash: string,
): Promise<{} | undefined> => {
	const selected = await showCommandBuilder<{}>({
		getPlaceholder: () => formatArgs(gitStashDrop(stash)),
		items: {},
	});

	return selected;
};
