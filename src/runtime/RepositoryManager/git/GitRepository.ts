import { collect } from "asxnc";
import * as vscode from "vscode";
import { GitCommit, GitIndex, GitRef } from "../../../universal/git";
import { handleError } from "../../handleError";
import { log } from "../../logger";
import { GitExtension, Repository } from "../vscode.git/types";
import { gitCheckout } from "./commands/gitCheckout";
import { gitLogCommits } from "./commands/gitLogCommits";
import { gitLogHeadHash } from "./commands/gitLogHeadHash";
import { gitResetHead } from "./commands/gitResetHead";
import { gitShowRefFile } from "./commands/gitShowRefFile";
import { gitShowRefs } from "./commands/gitShowRefs";
import { gitStashList } from "./commands/gitStashList";
import { gitStatus } from "./commands/gitStatus";
import { GitCommand } from "./commands/utils";
import { execGit } from "./execGit";

export class GitRepository {
	constructor(
		private repository: Repository,
		private extension: GitExtension,
	) {}

	public getPath() {
		return this.repository.rootUri.toString();
	}

	public async getCommits(): Promise<{
		stashes: GitCommit[];
		commits: AsyncIterable<GitCommit>;
	}> {
		const stashes = await collect(this.execGit(gitStashList()));

		const commits = this.execGit(gitLogCommits());

		return {
			stashes: stashes,
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

	public onDidChange(fn: () => void): vscode.Disposable {
		return this.repository.state.onDidChange(fn);
	}

	private execGit = <T>(cmd: GitCommand<T>): T => {
		const api = this.extension.getAPI(1);
		const repository = this.repository;

		return execGit(cmd, api.git.path, repository.rootUri.fsPath, handleError);
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
