import * as vscode from "vscode";
import { GitExtension } from "./types.js";

export const ensureGitExtension = () => {
	const git = vscode.extensions.getExtension<GitExtension>("vscode.git");

	if (!git) {
		vscode.window.showErrorMessage(
			"Preinstalled vscode.git extension is not activated",
		);
		throw new Error("Preinstalled vscode.git extension is not activated");
	}

	return git;
};
