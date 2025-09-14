import { GitResetMode, GitResetOptions } from "../git/commands/gitReset";
import { showCommandBuilder } from "./utils";

export const getResetOptions = async (
	treeish: string,
	initial?: Partial<GitResetOptions>,
) => {
	const result = await showCommandBuilder({
		getPlaceholder: (flags) => `git reset ${flags.join(" ")} ${treeish}`,
		initialValue: {
			soft: initial?.mode === "soft",
			mixed: initial?.mode === "soft",
			hard: initial?.mode === "hard",
		},
		items: {
			soft: {
				label: "--soft",
				type: "flag",
				radioGroup: "mode",
				description: "Reset to a commit without changing any file.",
			},
			mixed: {
				label: "--mixed",
				type: "flag",
				radioGroup: "mode",
				description: "Reset to a commit, but only reset index.",
			},
			hard: {
				label: "--hard",
				type: "flag",
				radioGroup: "mode",
				description: "Reset to a commit and discard any changes.",
			},
		},
	});

	if (!result) return;

	let mode: GitResetMode;
	if (result.hard) mode = "hard";
	if (result.mixed) mode = "mixed";
	if (result.soft) mode = "soft";

	return { mode: mode! };
};
