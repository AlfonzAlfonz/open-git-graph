import { spawn } from "node:child_process";
import { handleError } from "../handleError.js";
import { RuntimeState } from "../state/types.js";
import { Repository } from "../vscode.git/types.js";
import { getCommits } from "./GitCommands/getCommits.js";
import { getRefs } from "./GitCommands/getRefs.js";
import { GitCommand } from "./GitCommands/utils.js";
import { resetHead } from "./GitCommands/resetHead.js";
import { showRefFile } from "./GitCommands/showRefFile.js";
import { checkout } from "./GitCommands/checkout.js";

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

	public getCommits() {
		return this.execGit(getCommits());
	}

	public getRefs() {
		return this.execGit(getRefs());
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
