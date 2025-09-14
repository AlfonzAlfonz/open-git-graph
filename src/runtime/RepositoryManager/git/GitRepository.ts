import * as vscode from "vscode";
import { GitCommit, GitIndex } from "../../../universal/git";
import { handleError } from "../../handleError";
import { GitExtensionAPI } from "../vscode.git/utils";
import { gitCheckout, gitCheckoutCreate } from "./commands/gitCheckout";
import { gitLogCommits } from "./commands/gitLogCommits";
import { gitLogHeadHash } from "./commands/gitLogHeadHash";
import { gitShowCommit } from "./commands/gitShowCommit";
import { gitShowRefFile } from "./commands/gitShowRefFile";
import { gitShowRefs } from "./commands/gitShowRefs";
import { gitStashList } from "./commands/gitStashList";
import { gitStatus } from "./commands/gitStatus";
import { GitCommand } from "./commands/utils";
import { execGit } from "./execGit";
import { gitPull } from "./commands/gitPull";
import { gitReset, GitResetMode } from "./commands/gitReset";
import {
	DeleteBranchOptions,
	gitBranchDelete,
} from "./commands/gitBranchDelete";
import { gitPushDelete } from "./commands/gitPushDelete";
import { CherryPickOptions, gitCherryPick } from "./commands/gitCherryPick";

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
			this.execGit(gitStatus()),
			this.getLastCommitHash(),
		]);

		const index: GitIndex = {
			...status,
			parents: [parent],
		};

		return index;
	}

	public async getLastCommitHash() {
		return await this.execGit(gitLogHeadHash());
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

	public async checkoutCreate(branchName: string, startingPoint: string) {
		return await this.execGit(gitCheckoutCreate(branchName, startingPoint));
	}

	public async pull(ffOnly: boolean = true) {
		return await this.execGit(gitPull(ffOnly));
	}

	public async reset(mode: GitResetMode, treeish: string) {
		return await this.execGit(gitReset(mode, treeish));
	}

	public async branchDelete(branch: string, options: DeleteBranchOptions) {
		return await this.execGit(gitBranchDelete(branch, options));
	}

	public async pushDelete(origin: string, branches: string | string[]) {
		return await this.execGit(gitPushDelete(origin, branches));
	}

	public async cherryPick(commit: string, options: CherryPickOptions) {
		return await this.execGit(gitCherryPick(commit, options));
	}

	private execGit = <T>(cmd: GitCommand<T>): T => {
		return execGit(
			cmd,
			this.extension.git.path,
			this.repoPath.fsPath,
			handleError(false),
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
