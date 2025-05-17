import debug from "debug";
import util from "util";
import * as vscode from "vscode";

const DEV_DEBUG = [
	"git",
	"GraphTabManager",
	"WebviewRequestHandler",
	"RepositoryManager",
	// force indent
].join(",");

export let output: vscode.LogOutputChannel;

export interface Logger {
	appendLine: (value: string) => void;
	dispose: () => void;
}

export const log = (name: string) => {
	if (!output) {
		output = vscode.window.createOutputChannel("Open git graph", { log: true });

		debug.inspectOpts = {
			colors: false,
			hideDate: true,
		};

		debug.enable(DEV_DEBUG);
	}

	const d = debug(name);

	d.log = (...[_, first, ...args]: unknown[]) => {
		output.info(
			`[${name}] ${
				typeof first === "string" ? first : util.inspect(first, false, 2, false)
			} ${args.map((a) => util.inspect(a, false, 2, false)).join(" ")}`,
		);
	};

	return (...args: unknown[]) => {
		d("", ...args);
	};
};
