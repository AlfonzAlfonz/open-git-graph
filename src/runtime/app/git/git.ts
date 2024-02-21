import { asxnc } from "asxnc";
import { ensureGitExtension } from "../../store/vscode.git";
import { Repository } from "../../store/vscode.git/types";
import { RuntimeCtx } from "../ctx";

type GitEvent = ["", {}];

export type GitService = {
	getRepositories: () => Repository[];
};

export const gitEvents = asxnc.eventTarget(asxnc.pubsub<GitEvent>());

export const gitSaga = (ctx: RuntimeCtx) =>
	ctx.service("git", ["logger"], async ({ register }, { logger }) => {
		const gitExt = ensureGitExtension();

		const api = gitExt.exports.getAPI(1);

		const repositories = new Map<string, Repository>(
			api.repositories.map((r) => [r.rootUri.toString(), r]),
		);

		const disposables = [
			api.onDidChangeState((a) => {
				// TODO: handle git state changes
				logger.dispatch({ value: "[vscode.git] State changed", done: false });
			}),

			api.onDidOpenRepository((r) => {
				repositories.set(r.rootUri.toString(), r);
			}),

			api.onDidCloseRepository((r) => {
				repositories.delete(r.rootUri.toString());
			}),
		];

		await register({
			getRepositories: () => [...repositories.values()],
		});

		disposables.forEach((d) => d.dispose());
	});
