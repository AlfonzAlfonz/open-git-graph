import * as vscode from "vscode";

let logger: vscode.OutputChannel;

export const ensureLogger = () => {
	if (!logger) logger = vscode.window.createOutputChannel("Open git graph");
	return logger;
};
