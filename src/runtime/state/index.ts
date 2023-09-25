import { createStore } from "zustand/vanilla";
import { catchErrors } from "../handleError.js";
import { Lazy, RuntimeState, RuntimeStore } from "./types.js";
import { watchGit } from "./watchGit.js";
import * as vscode from "vscode";
import { ensureGitExtension } from "../vscode.git/index.js";

export const runtimeStore = (
	logger: vscode.OutputChannel,
): Lazy<RuntimeStore> => {
	let store: RuntimeStore | undefined;

	const create = (): RuntimeStore => {
		const git = ensureGitExtension();

		const { setState, ...store } = createStore<RuntimeState>(() => ({
			extension: git.exports,
			repository: {},
			logger,
		}));

		return {
			...store,
			dispatch: catchErrors(store.getState(), (action) => {
				switch (action.type) {
					case "SET_REPOSITORY":
						setState((s) => ({
							repository: {
								...s.repository,
								[action.repository.rootUri.toString()]: action.repository,
							},
						}));
						break;
					case "REMOVE_REPOSITORY":
						setState((s) => {
							const { [action.rootUri.toString()]: _, ...repository } =
								s.repository;
							return { repository };
						});
						break;
					default: {
						action satisfies never;
					}
				}
			}),
		};
	};

	return {
		ensure: () => {
			if (!store) {
				store = create();
				watchGit(store);
			}
			return store;
		},
	};
};
