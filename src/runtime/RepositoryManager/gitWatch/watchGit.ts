import { Queue } from "@alfonz/async/Queue";
import path from "path";
import * as vscode from "vscode";
import { log } from "../../logger";

const debug = log("watchGit");

type FsEvent = {
	type: "changed" | "created" | "deleted";
	path: string;
};

export function watchGit(repoPath: string, signal: AbortSignal | undefined) {
	const watcher = vscode.workspace.createFileSystemWatcher(
		path.join(repoPath, ".git", "/**"),
	);

	const [it, dispatch] = Queue.create<FsEvent>();

	const listener = (type: FsEvent["type"]) => (uri: vscode.Uri) => {
		debug("fs event", type, path.relative(repoPath, uri.fsPath));
		dispatch(
			{
				type,
				path: path.relative(repoPath, uri.fsPath),
			},
			false,
		);
	};

	const dis = [
		watcher.onDidChange(listener("changed")),
		watcher.onDidCreate(listener("created")),
		watcher.onDidDelete(listener("deleted")),
	];

	signal?.addEventListener("abort", () => {
		dis.forEach((d) => d.dispose());
		dispatch(undefined, true);
	});

	return it;
}

export async function* aggregateGitEvents(it: AsyncIterableIterator<FsEvent>) {
	for await (const { type, path: p } of it) {
		if (
			type === "deleted" &&
			p.startsWith(".git/refs/") &&
			p.endsWith(".lock")
		) {
			debug("ref-update");
			yield { type: "ref-update" };
			continue;
		}
		if (type === "deleted" && p === ".git/packed-refs.lock") {
			debug("ref-update");
			yield { type: "ref-update" };
			continue;
		}

		if (type === "deleted" && p === ".git/index.lock") {
			debug("index-update");
			yield { type: "index-update" };
			continue;
		}

		debug(`ignoring fs event ${type} at ${p}`);
	}
}
