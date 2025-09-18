import { gitStashApply, StashOptions } from "../git/commands/gitStash";
import { formatArgs, showCommandBuilder } from "./utils";

export const getStashOptions =
	(command: typeof gitStashApply) =>
	async (
		stash: string,
		initialValue: StashOptions,
	): Promise<StashOptions | undefined> => {
		const selected = await showCommandBuilder<StashOptions>({
			getPlaceholder: (o) => formatArgs(command(stash, o)),
			initialValue,
			items: {
				index: {
					label: "--index",
					description: "",
					type: "other",
				},
			},
		});

		return selected;
	};
