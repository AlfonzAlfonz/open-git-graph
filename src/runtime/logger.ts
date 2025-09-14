import debug from "debug";
import util from "util";
import * as vscode from "vscode";

const DEV_DEBUG: string[] = [
	// "git",
	// "graphCommand",
	// "GraphTabManager",
	// "WebviewRequestHandler",
	// "RepositoryManager",
	// force indent
];

export let output: vscode.LogOutputChannel;

export interface Logger {
	appendLine: (value: string) => void;
	dispose: () => void;
}

export const log = (name: string) => {
	if (!vscode.window) return () => {};

	if (!output) {
		output = vscode.window.createOutputChannel("Open git graph", { log: true });

		debug.inspectOpts = {
			colors: false,
			hideDate: true,
		};

		debug.enable("*");

		debug.log = (...[_, ...args]: unknown[]) => {
			if (typeof args[0] === "string" && DEV_DEBUG.includes(args[0])) {
				output.info(format(...args));
			} else {
				output.debug(format(...args));
			}
		};
	}

	const d = debug(`ogg.${name}`);

	return (...args: unknown[]) => {
		d("", `[${name}]`, ...args);
	};
};

export const format = (...[first, ...args]: unknown[]) => {
	return `${
		typeof first === "string" ? first : util.inspect(first, false, 2, false)
	} ${args.map((a) => util.inspect(a, false, 2, false)).join(" ")}`;
};

export const patchConsole = () => {
	const timeMap = new Map<string, DOMHighResTimeStamp>();

	global.console = {
		log: (...args: any) => output.info(format(...args)),
		info: (...args: any) => output.info(format(...args)),
		warn: (...args: any) => output.warn(format(...args)),
		error: (...args: any) => output.error(format(...args)),
		time: (name: string) => {
			timeMap.set(name, performance.now());
		},
		timeEnd: (name: string) => {
			const end = performance.now();
			output.info(`${name} took ${end - timeMap.get(name)!}ms`);
		},
	} satisfies Partial<Console> as Console;
};
