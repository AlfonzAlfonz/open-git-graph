import { errorToString } from "../universal/errorToString.js";
import { Lazy, RuntimeState, RuntimeStore } from "./state/types.js";
import * as vscode from "vscode";

export const handleError = (state: RuntimeState) => (e: unknown) => {
	if (e instanceof Error) {
		vscode.window.showErrorMessage(e.message);
	}
	state.logger.append(errorToString(e));
};

export const catchErrors =
	<TArgs extends any[], TReturn>(
		state: RuntimeState | RuntimeStore | Lazy<RuntimeStore>,
		cb: (...args: TArgs) => TReturn,
	) =>
	(...args: TArgs) => {
		const _catch = (e: unknown) => {
			state = "ensure" in state ? state.ensure() : state;
			state = "getState" in state ? state.getState() : state;
			handleError(state)(e);
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
