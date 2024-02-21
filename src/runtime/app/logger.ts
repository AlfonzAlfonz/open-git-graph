import { Queue, asxnc } from "asxnc";
import * as vscode from "vscode";
import { RuntimeCtx } from "./ctx";

export type LoggerService = Queue<string | ["warn" | "error", string], unknown>;

export const loggerSaga = async (ctx: RuntimeCtx) =>
	ctx.service("logger", [], async ({ register }) => {
		let output: vscode.OutputChannel | undefined;

		const logger = asxnc.queue<string | ["warn" | "error", string]>();

		await asxnc.race([
			register(logger),
			async () => {
				for await (const e of logger.iterator) {
					try {
						if (!output)
							output = vscode.window.createOutputChannel("Open git graph");

						output.appendLine(
							Array.isArray(e) ? e[0].toUpperCase() + ": " + e[1] : e,
						);
					} catch (e) {
						console.error("aaaaaa", e);
					}
				}
			},
		]);

		output?.dispose();
	});
