import {
	gitReset,
	GitResetMode,
	GitResetOptions,
} from "../git/commands/gitReset";
import { formatArgs, showCommandBuilder } from "./utils";

export const getResetOptions = async (
	treeish: string,
	initial?: Partial<GitResetOptions>,
) => {
	const result = await showCommandBuilder({
		getPlaceholder: (o) => {
			let mode: GitResetMode | undefined;
			if (o.hard) mode = "hard";
			if (o.mixed) mode = "mixed";
			if (o.soft) mode = "soft";
			return formatArgs(gitReset(treeish, { mode }));
		},
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

	let mode: GitResetMode | undefined;
	if (result.hard) mode = "hard";
	if (result.mixed) mode = "mixed";
	if (result.soft) mode = "soft";

	return { mode };
};
