import { spawn } from "node:child_process";
import { GitCommit, GitIndex, GitRef } from "../../universal/git.js";
import { handleError } from "../handleError.js";
import { buffer } from "../utils.js";
import { GitExtension, Repository } from "../store/vscode.git/types.js";
import { gitCheckout } from "./commands/gitCheckout.js";
import { gitLogCommits } from "./commands/gitLogCommits.js";
import { gitLogHeadHash } from "./commands/gitLogHeadHash.js";
import { gitResetHead } from "./commands/gitResetHead.js";
import { gitShowRefFile } from "./commands/gitShowRefFile.js";
import { gitShowRefs } from "./commands/gitShowRefs.js";
import { gitStashList } from "./commands/gitStashList.js";
import { gitStatus } from "./commands/gitStatus.js";
import { GitCommand } from "./commands/utils.js";
import { ensureLogger } from "../logger.js";

export class GitRepository {
	constructor(
		private repository: Repository,
		private extension: GitExtension,
	) {}

	public async getCommits(): Promise<{
		stashes: GitRef[];
		commits: AsyncIterable<GitCommit>;
	}> {
		const stashes = await buffer(this.execGit(gitStashList()));
		const commits = this.execGit(gitLogCommits());

		return {
			stashes: stashes.map((s) => ({ type: "stash", hash: s.hash })),
			commits: this.addStashes(commits, stashes),
		};
	}

	public getRefs() {
		return this.execGit(gitShowRefs());
	}

	public async getIndex() {
		const status = this.execGit(gitStatus());

		const index: GitIndex = {
			parents: [await this.getLastCommitHash()],
			tracked: [],
			untracked: [],
		};

		for await (const [tracked, untracked] of status) {
			tracked && index.tracked.push(tracked);
			untracked && index.untracked.push(untracked);
		}

		return index;
	}

	public async getLastCommitHash() {
		return await this.execGit(gitLogHeadHash());
	}

	public async reset(ref: string, mode: "soft" | "mixed" | "hard") {
		return await this.execGit(gitResetHead(ref, mode));
	}

	public trueMerge() {}

	public ffMerge() {}

	public async showFile(ref: string, path: string) {
		return await this.execGit(gitShowRefFile(ref, path));
	}

	public async checkout(branch: string) {
		return await this.execGit(gitCheckout(branch));
	}

	private execGit = <T>(cmd: GitCommand<T>): T => {
		const api = this.extension.getAPI(1);
		const repository = this.repository;

		ensureLogger().appendLine(`[git] ${api.git.path} ${cmd.args.join(" ")}`);

		const child = spawn(api.git.path, cmd.args, {
			cwd: repository.rootUri.fsPath,
		});

		child.on("error", (e) => handleError(e));

		return cmd.parse(
			child.stdout,
			new Promise((resolve) => {
				child.on("exit", (...args) => resolve(args));
			}),
		);
	};

	private async *addStashes(
		commits: AsyncIterable<GitCommit>,
		stashes: GitCommit[],
	) {
		for await (const c of commits) {
			for (const s of stashes) {
				if (s.parents.includes(c.hash)) {
					yield s;
				}
			}
			yield c;
		}
	}
}
