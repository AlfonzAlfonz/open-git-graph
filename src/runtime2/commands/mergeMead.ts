import * as vscode from "vscode";
import { command } from "../utils";

export const mergeHeadCommand = command({
	id: "open-git-graph.merge-head",
	command: () => () => {
		vscode.window.showInformationMessage("Merge current");
	},
});
