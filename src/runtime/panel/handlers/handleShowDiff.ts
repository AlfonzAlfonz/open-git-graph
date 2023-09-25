import * as vscode from "vscode";
import { ShowDiffMessage } from "../../../types/messages.js";
import { ShowFileTextDocumentContentProvider } from "../../ShowFileTextDocumentContentProvider.js";
import { Handler } from "../types.js";

export const handleShowDiff: Handler<ShowDiffMessage> = async (
	{ path, a, b },
	getState,
) => {
	await getState(async (s) => {
		await vscode.commands.executeCommand(
			"vscode.diff",
			ShowFileTextDocumentContentProvider.createUri(a, path, s.panelRepository),
			ShowFileTextDocumentContentProvider.createUri(b, path, s.panelRepository),
			"Swag",
		);
	});
};
