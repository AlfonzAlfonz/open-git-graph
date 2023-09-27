import * as vscode from "vscode";
import { ShowDiffMessage } from "../../../types/messages.js";
import { ShowFileTextDocumentContentProvider } from "../../ShowFileTextDocumentContentProvider.js";
import { Handler } from "../types.js";

export const handleShowDiff: Handler<ShowDiffMessage> = async ({
	msg: { path, a, b },
	panelState: { repoPath },
}) => {
	await vscode.commands.executeCommand(
		"vscode.diff",
		ShowFileTextDocumentContentProvider.createUri(a, path, repoPath),
		ShowFileTextDocumentContentProvider.createUri(b, path, repoPath),
		"Swag",
	);
};
