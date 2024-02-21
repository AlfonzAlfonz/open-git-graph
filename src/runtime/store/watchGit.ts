import { RuntimeStore } from ".";

export const watchGit = (store: RuntimeStore) => {
	const api = store.getState().extension.getAPI(1);

	for (const r of api.repositories) {
		store.setRepository(r);
	}

	api.onDidChangeState((a) => {
		// ensureLogger().appendLine("[vscode.git] State changed");
		// TODO: handle git state changes
	});
	api.onDidOpenRepository((r) => {
		store.setRepository(r);
	});
	api.onDidCloseRepository((e) => {
		store.removeRepository(e.rootUri);
	});
};
