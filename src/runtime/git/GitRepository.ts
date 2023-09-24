import { spawn } from "node:child_process";
import { handleError } from "../handleError.js";
import { RuntimeState } from "../state/types.js";
import { GitCommand, GitCommands } from "./GitCommands.js";
import { Repository } from "../vscode.git/types.js";

export class GitRepository {
	constructor(
		private state: RuntimeState,
		private repository: Repository,
	) {}

	public getCommits() {
		return this.execGit(GitCommands.getCommits());
	}

	public getRefs() {
		return this.execGit(GitCommands.getRefs());
	}

	/**
	 * @param ref tree-ish reference
	 * @param path absolute path to the file
	 * @returns file contents
	 */
	public async showFile(ref: string, path: string) {
		const repository = this.repository;
		return await repository.show(ref, path);
	}

	private execGit = <T>(cmd: GitCommand<T>): T => {
		const api = this.state.extension.getAPI(1);
		const repository = this.repository;

		this.state.logger.appendLine(`Git: ${api.git.path} ${cmd.args.join(" ")}`);

		const child = spawn(api.git.path, cmd.args, {
			cwd: repository.rootUri.fsPath,
		});

		child.on("error", (e) => handleError(this.state)(e));

		return cmd.parse(child.stdout);
	};
}
