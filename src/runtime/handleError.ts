import * as vscode from "vscode";
import { GitError } from "./RepositoryManager/errors/GitError";

export type ErrorHandler = (e: unknown) => void;

export const handleError = (modal: boolean) => (e: unknown) => {
	if (modal && e instanceof GitError) {
		vscode.window.showErrorMessage("Git failed", {
			modal,
			detail: e.message,
		});
		return;
	}

	if (e instanceof Error) {
		vscode.window.showErrorMessage(e.message, { modal });
	}

	console.error(e);
};

export const catchErrors =
	<TArgs extends any[], TReturn>(
		cb: (...args: TArgs) => TReturn,
		onError: ErrorHandler = handleError(false),
	) =>
	(...args: TArgs) => {
		const _catch = (e: unknown) => {
			onError(e);
		};

		try {
			const result = cb(...args);

			if (isThenable(result)) {
				// promises if not awaited won't be caught in the catch block
				return result.then((x) => x, _catch);
			} else {
				return result;
			}
		} catch (e) {
			_catch(e);
		}
	};

const isThenable = (x: unknown): x is Thenable<unknown> =>
	!!x && typeof x === "object" && "then" in x && typeof x.then === "function";
