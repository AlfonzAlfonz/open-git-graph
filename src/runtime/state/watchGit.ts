import { RuntimeStore } from "./types";

export const watchGit = (store: RuntimeStore) => {
	const api = store.getState().extension.getAPI(1);

	for (const r of api.repositories) {
		store.dispatch({ type: "SET_REPOSITORY", repository: r });
	}

	api.onDidChangeState((e) => {
		// TODO: handle git state changes
	});
	api.onDidOpenRepository((r) => {
		store.dispatch({ type: "SET_REPOSITORY", repository: r });
	});
	api.onDidCloseRepository((e) => {
		store.dispatch({ type: "REMOVE_REPOSITORY", rootUri: e.rootUri });
	});
};
