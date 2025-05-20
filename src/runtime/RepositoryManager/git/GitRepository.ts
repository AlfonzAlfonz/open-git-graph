import { collect } from "asxnc";
import * as vscode from "vscode";
import { GitCommit, GitIndex } from "../../../universal/git";
import { handleError } from "../../handleError";
import { GitExtensionAPI } from "../vscode.git/utils";
import { gitCheckout } from "./commands/gitCheckout";
import { gitLogCommits } from "./commands/gitLogCommits";
import { gitLogHeadHash } from "./commands/gitLogHeadHash";
import { gitResetHead } from "./commands/gitResetHead";
import { gitShowCommit } from "./commands/gitShowCommit";
import { gitShowRefFile } from "./commands/gitShowRefFile";
import { gitShowRefs } from "./commands/gitShowRefs";
import { gitStashList } from "./commands/gitStashList";
import { gitStatus } from "./commands/gitStatus";
import { GitCommand } from "./commands/utils";
import { execGit } from "./execGit";

export class GitRepository {
	constructor(
		private repoPath: Pick<vscode.Uri, "fsPath">,
		private extension: GitExtensionAPI,
	) {}

	public getPath() {
		return this.repoPath.toString();
	}

	public getFsPath() {
		return this.repoPath.fsPath;
	}

	public getCommits() {
		return this.execGit(gitLogCommits(false));
	}

	public getStashes() {
		return this.execGit(gitStashList(false));
	}

	public getRefs() {
		return this.execGit(gitShowRefs());
	}

	public async getIndex() {
		const [status, parent] = await Promise.all([
			collect(this.execGit(gitStatus())),
			this.getLastCommitHash(),
		]);

		const index: GitIndex = {
			parents: [parent],
			tracked: [],
			untracked: [],
		};

		for (const [tracked, untracked] of status) {
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

	public async getCommit(hash: string) {
		return await this.execGit(gitShowCommit(hash));
	}

	public async checkout(branch: string) {
		return await this.execGit(gitCheckout(branch));
	}

	private execGit = <T>(cmd: GitCommand<T>): T => {
		return execGit(
			cmd,
			this.extension.git.path,
			this.repoPath.fsPath,
			handleError,
		);
	};

	public async *addStashes(
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
