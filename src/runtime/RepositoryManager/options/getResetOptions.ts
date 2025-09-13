import { GitResetMode } from "../git/commands/gitReset";
import { showCommandBuilder } from "./utils";

export const getResetOptions = async (treeish: string) => {
	const result = await showCommandBuilder({
		getPlaceholder: (flags) => `git reset ${flags.join(" ")} ${treeish}`,
		flags: [
			{
				label: "--soft",
				radioGroup: "mode",
				description: "Reset to a commit without changing any file.",
			},
			{
				label: "--mixed",
				radioGroup: "mode",
				description: "Reset to a commit, but only reset index.",
			},
			{
				label: "--hard",
				radioGroup: "mode",
				description: "Reset to a commit and discard any changes.",
			},
		],
		other: [],
	});

	if (!result) return;

	return {
		mode: result[0]!.label.slice(2) as GitResetMode,
	};
};
