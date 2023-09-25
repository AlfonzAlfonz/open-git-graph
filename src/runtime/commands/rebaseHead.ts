import * as vscode from "vscode";
import { command } from "../utils";

export const rebaseHeadCommand = command({
	id: "open-git-graph.rebase-head",
	command: () => () => {
		vscode.window.showInformationMessage("Rebase current");
	},
});
