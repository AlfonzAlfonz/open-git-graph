import * as vscode from "vscode";
import { ShowDiffMessage } from "../../../types/messages.js";
import { ShowFileTextDocumentContentProvider } from "../../ShowFileTextDocumentContentProvider.js";
import { Handler } from "../types.js";

export const handleShowDiff: Handler<ShowDiffMessage> = async (
	{ a, b },
	getState,
) => {
	await getState(async (s) => {
		await vscode.commands.executeCommand(
			"vscode.diff",
			ShowFileTextDocumentContentProvider.createUri(
				a[0],
				a[1],
				s.panelRepository,
			),
			ShowFileTextDocumentContentProvider.createUri(
				b[0],
				b[1],
				s.panelRepository,
			),
			"Swag",
		);
	});
};
