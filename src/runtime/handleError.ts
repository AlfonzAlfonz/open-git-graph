import * as vscode from "vscode";
import { errorToString } from "../universal/errorToString.js";
import { ensureLogger } from "./logger.js";

export const handleError = (e: unknown) => {
	if (e instanceof Error) {
		vscode.window.showErrorMessage(e.message);
	}
	ensureLogger().append(errorToString(e));
};

export const catchErrors =
	<TArgs extends any[], TReturn>(cb: (...args: TArgs) => TReturn) =>
	(...args: TArgs) => {
		const _catch = (e: unknown) => {
			handleError(e);
		};

		try {
			const result = cb(...args);

			if (isThenable(result)) {
				// promises if not awaited won't be catched in the catch block
				return result.then((x) => x, _catch);
			} else {
				return result;
			}
		} catch (e) {
			_catch(e);
		}
	};

export const errors = {
	noRepo: () => new Error("Cannot execute git outside of a repository"),
	gitFailed: (exitCode: number) =>
		new Error(`Git failed (exit code ${exitCode}) to execute a command.`),
};

const isThenable = (x: unknown): x is Thenable<unknown> =>
	!!x && typeof x === "object" && "then" in x && typeof x.then === "function";
