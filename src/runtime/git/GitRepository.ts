import { spawn } from "node:child_process";
import { handleError } from "../handleError.js";
import { RuntimeState } from "../state/types.js";
import { Repository } from "../vscode.git/types.js";
import { logCommits } from "./GitCommands/logCommits.js";
import { showRefs } from "./GitCommands/showRefs.js";
import { GitCommand } from "./GitCommands/utils.js";
import { resetHead } from "./GitCommands/resetHead.js";
import { showRefFile } from "./GitCommands/showRefFile.js";
import { checkout } from "./GitCommands/checkout.js";
import { stashList } from "./GitCommands/stashList.js";
import { buffer } from "../utils.js";

export class GitRepository {
	private repository: Repository;

	constructor(
		private state: RuntimeState,
		repository: Repository | string,
	) {
		const repo =
			typeof repository !== "string"
				? repository
				: state.repository[repository];

		if (!repo) {
			throw new Error("Invalid repository path");
		}
		this.repository = repo;
	}

	public async *getCommits() {
		const stashes = await buffer(this.execGit(stashList()));
		stashes.sort((a, b) => b.commitDate - a.commitDate);

		for await (const c of this.execGit(logCommits())) {
			while ((stashes[0]?.commitDate ?? 0) > c.commitDate) {
				yield stashes.shift()!;
			}
			yield c;
		}
	}

	public getRefs() {
		return this.execGit(showRefs());
	}

	public async reset(ref: string, mode: "soft" | "mixed" | "hard") {
		return await this.execGit(resetHead(ref, mode));
	}

	public trueMerge() {}

	public ffMerge() {}

	public async showFile(ref: string, path: string) {
		return await this.execGit(showRefFile(ref, path));
	}

	public async checkout(branch: string) {
		return await this.execGit(checkout(branch));
	}

	private execGit = <T>(cmd: GitCommand<T>): T => {
		const api = this.state.extension.getAPI(1);
		const repository = this.repository;

		this.state.logger.appendLine(`[git] ${api.git.path} ${cmd.args.join(" ")}`);

		const child = spawn(api.git.path, cmd.args, {
			cwd: repository.rootUri.fsPath,
		});

		child.on("error", (e) => handleError(this.state)(e));

		return cmd.parse(
			child.stdout,
			new Promise((resolve) => {
				child.on("exit", (...args) => resolve(args));
			}),
		);
	};
}
