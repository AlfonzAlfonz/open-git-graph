import { createStore } from "zustand/vanilla";
import { handleError } from "../handleError.js";
import { Lazy, RuntimeState, RuntimeStore } from "./types.js";
import { watchGit } from "./watchGit.js";

export const runtimeStore = (init: RuntimeState): Lazy<RuntimeStore> => {
	let store: RuntimeStore | undefined;

	const create = (): RuntimeStore => {
		const { setState, ...store } = createStore<RuntimeState>(() => init);

		return {
			...store,
			dispatch: (action) => {
				const state = store.getState();
				try {
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
				} catch (e) {
					handleError(state)(e);
				}
			},
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
