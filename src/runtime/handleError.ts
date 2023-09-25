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
		try {
			return cb(...args);
		} catch (e) {
			state = "ensure" in state ? state.ensure() : state;
			state = "getState" in state ? state.getState() : state;
			handleError(state)(e);
		}
	};

const errorToString = (e: unknown) => {
	if (typeof e === "object" && e instanceof Error) {
		return `
Error occured
  ${e.message}
  ${e.stack}
  ${tryStringify(e)}
    `;
	}

	return `
Error occured
  ${
		typeof e === "object" && e && ("toString" in e || Symbol.toStringTag in e)
			? String(e)
			: ""
	}
  ${tryStringify(e)}
`;
};

export const errors = {
	noRepo: () => new Error("Cannot execute git outside of a repository"),
	gitFailed: (exitCode: number) =>
		new Error(`Git failed (exit code ${exitCode}) to execute a command.`),
};

const tryStringify = (e: unknown) => {
	try {
		return JSON.stringify(e);
	} catch {
		return "{ not stringifiable ) }";
	}
};
