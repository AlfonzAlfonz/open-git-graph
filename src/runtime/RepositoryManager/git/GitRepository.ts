import * as vscode from "vscode";
import { GitCommit, GitIndex } from "../../../universal/git";
import { handleError } from "../../handleError";
import { GitExtensionAPI } from "../vscode.git/utils";
import {
	DeleteBranchOptions,
	gitBranchDelete,
} from "./commands/gitBranchDelete";
import { gitCheckout, gitCheckoutCreate } from "./commands/gitCheckout";
import { CherryPickOptions, gitCherryPick } from "./commands/gitCherryPick";
import { gitFetch } from "./commands/gitFetch";
import { gitLogCommits } from "./commands/gitLogCommits";
import { gitLogHeadHash } from "./commands/gitLogHeadHash";
import { gitMerge, MergeOptions } from "./commands/gitMerge";
import { gitPull } from "./commands/gitPull";
import { gitPush, PushOptions } from "./commands/gitPush";
import { gitPushDelete, PushDeleteOptions } from "./commands/gitPushDelete";
import { gitRebase, RebaseOptions } from "./commands/gitRebase";
import { gitRemote } from "./commands/gitRemote";
import { gitReset, GitResetOptions } from "./commands/gitReset";
import { gitShowCommit } from "./commands/gitShowCommit";
import { gitShowRefFile } from "./commands/gitShowRefFile";
import { gitShowRefs } from "./commands/gitShowRefs";
import { gitStashList } from "./commands/gitLogStashes";
import { gitStatus } from "./commands/gitStatus";
import { gitTag, TagOptions } from "./commands/gitTag";
import { GitCommand } from "./commands/utils";
import { execGit } from "./execGit";
import {
	gitStashApply,
	gitStashDrop,
	gitStashPop,
	StashOptions,
} from "./commands/gitStash";

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

	public getRemotes() {
		return this.execGit(gitRemote());
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

	public async fetch() {
		return await this.execGit(gitFetch());
	}

	public async pull(ffOnly: boolean = true) {
		return await this.execGit(gitPull(ffOnly));
	}

	public async reset(treeish: string, options: GitResetOptions) {
		return await this.execGit(gitReset(treeish, options));
	}

	public async branchDelete(branch: string, options: DeleteBranchOptions) {
		return await this.execGit(gitBranchDelete(branch, options));
	}

	public async push(
		remote: string,
		refspec: string | string[],
		options: PushOptions,
	) {
		return await this.execGit(gitPush(remote, refspec, options));
	}

	public async pushDelete(
		remote: string,
		refspec: string | string[],
		options: PushDeleteOptions,
	) {
		return await this.execGit(gitPushDelete(remote, refspec, options));
	}

	public async cherryPick(commit: string, options: CherryPickOptions) {
		return await this.execGit(gitCherryPick(commit, options));
	}

	public async rebase(upstream: string, options: RebaseOptions) {
		return await this.execGit(gitRebase(upstream, options));
	}

	public async merge(upstream: string, options: MergeOptions) {
		return await this.execGit(gitMerge(upstream, options));
	}

	public async tag(commitOrObject: string, options: TagOptions) {
		return await this.execGit(gitTag(commitOrObject, options));
	}

	public async stashApply(stash: string, options: StashOptions) {
		return await this.execGit(gitStashApply(stash, options));
	}

	public async stashPop(stash: string, options: StashOptions) {
		return await this.execGit(gitStashPop(stash, options));
	}

	public async stashDrop(stash: string) {
		return await this.execGit(gitStashDrop(stash));
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
