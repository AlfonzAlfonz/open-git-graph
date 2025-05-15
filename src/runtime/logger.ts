import * as vscode from "vscode";

let logger: vscode.OutputChannel;

export interface Logger {
	appendLine: (value: string) => void;
	dispose: () => void;
}

export const ensureLogger = (name: string): Logger => {
	return {
		appendLine: (value: string) => {
			if (!logger) logger = vscode.window.createOutputChannel("Open git graph");
			logger.appendLine(`[${name}]: ${value}`);
		},
		dispose: () => {
			logger.dispose();
		},
	};
};
