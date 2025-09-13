import { collect, Mutex, Pylon } from "@alfonz/async";
import vscode from "vscode";
import { GitCommit, GitRef, GitRefBranch } from "../../universal/git";
import { groupBy } from "../../universal/groupBy";
import { createGraphNodes, Graph } from "../GraphTabManager/createGraphNodes";
import { showOptionPicker } from "../showOptionPicker";
import { pipeThrough, take } from "../utils";
import { DeleteBranchOptions } from "./git/commands/gitBranchDelete";
import { CherryPickOptions } from "./git/commands/gitCherryPick";
import { GitResetOptions } from "./git/commands/gitReset";
import { GitRepository } from "./git/GitRepository";
import { getCherryPickOptions } from "./options/getCherryPickOptions";
import { getDeleteBranchOptions } from "./options/getDeleteBranchOptions";
import { getResetOptions } from "./options/getResetOptions";
import { showCommandBuilder } from "./options/utils";
import { RebaseOptions } from "./git/commands/gitRebase";
import { getRebaseOptions } from "./options/getRebaseOptions";
import { MergeOptions } from "./git/commands/gitMerge";
import { getMergeOptions } from "./options/getMergeOptions";

type RepositoryState = {
	refs: GitRef[];
	currentBranch: string | undefined;

	graph: Graph;
};

type InnerState = {
	graphIterator?: AsyncIterator<Graph, void, Iterable<GitCommit>>;
};

export class RepositoryStateHandle {
	private innerState: Mutex<InnerState> = Mutex.create({});

	private pylon = Pylon.create<RepositoryState>();

	constructor(private repository: GitRepository) {}

	get state() {
		return this.pylon.iterator;
	}

	async pollGraphData() {
		await this.innerState.acquire(async (value) => {
			const graph = (await value.graphIterator!.next()).value!;

			this.pylon.swap((s) => ({ ...s, graph }));
		})!;
	}

	async getGraphData(force?: boolean) {
		await this.innerState.acquire(async (value) => {
			if (!force && this.state.readSync()) {
				this.pylon.bump();
				return;
			}

			console.time("fetch git commits");

			const commits = this.repository.getCommits();

			const [refs, index, stashes] = await Promise.all([
				this.repository.getRefs(),
				this.repository.getIndex(),
				collect(this.repository.getStashes()),
			]);

			const commitsWithStashes = this.repository.addStashes(commits, stashes);

			console.timeEnd("fetch git commits");

			console.time("collect commits");

			const iterator = commitsWithStashes[Symbol.asyncIterator]();
			const data = await collect(take(iterator, 100));

			console.timeEnd("collect commits");

			const graphIterator = createGraphNodes(data, index, stashes);

			const graph = graphIterator.next().value!;

			this.pylon.swap({
				graph,
				currentBranch: index.branch,
				refs: [
					...refs,
					...stashes.map((s) => ({ type: "stash" as const, hash: s.hash })),
				],
			});

			value.graphIterator = pipeThrough(iterator, graphIterator);
		});
	}

	async reset(treeish: string, options?: GitResetOptions) {
		const selected = await getResetOptions(treeish, options);
		if (!selected) return;

		await this.repository.reset(treeish, selected);
	}

	async checkout(branch: string) {
		const localBranches = (await this.state.read()).refs
			.filter(
				(r): r is GitRefBranch => r.type === "branch" && r.remote === undefined,
			)
			.map((r) => r.name);

		if (localBranches.includes(branch)) {
			// branch exists locally
			await this.repository.checkout(branch);
		} else {
			const [, ...rest] = branch.split("/");
			const localName = rest.join("/");

			if (localBranches.includes(localName)) {
				// branch exists locally, but doesn't match remote branch from parameter
				const result = await showCommandBuilder({
					title: "This branch already exists, do you want to:",
					getPlaceholder: () => "This branch already exists, do you want to:",
					canSelectMany: false,
					items: {
						checkout: {
							label: "Checkout",
							type: "other",
						},
						checkoutPull: {
							label: "Checkout & pull",
							type: "other",
						},
						checkoutReset: {
							label: "Checkout & reset",
							type: "other",
						},
					},
				});

				if (!result) return;

				if (result.checkout) {
					await this.repository.checkout(localName);
				}

				if (result.checkoutPull) {
					await this.repository.checkout(localName);
					await this.repository.pull();
				}

				if (result.checkoutReset) {
					await this.repository.checkout(localName);
					await this.reset(branch, { mode: "hard" });
				}
				return;
			}

			// branch does not exist locally and has to be created

			const name = await vscode.window.showInputBox({
				title:
					"Branch is not checkout locally, what should be the name of local branch?",
				value: localName,
				valueSelection: [rest.length, rest.length],
			});

			if (name === undefined) return;

			await this.repository.checkoutCreate(name, branch);
		}
	}

	public async deleteBranch(
		branch: string,
		remotes: string[],
		options?: DeleteBranchOptions & { remotes?: boolean },
	) {
		const state = await this.state.read();

		const ref = state.refs.find(
			(r): r is GitRefBranch => r.type === "branch" && r.name === branch,
		);

		if (!ref) throw new Error("Branch does not exist");
		if (ref.remote) throw new Error("Trying to remove remote branch");

		const selected = await getDeleteBranchOptions(branch, options);
		if (!selected) return;

		await this.repository.branchDelete(branch, selected);

		if (selected.remotes) {
			await this.deleteRemoteBranches(remotes.map((r) => `${r}/${branch}`));
		}
	}

	public async deleteRemoteBranches(branches: string[]) {
		const origins = groupBy(
			branches.map((b) => {
				const [origin, ...rest] = b.split("/");
				const branchName = rest.join("/");
				return [origin!, branchName] as const;
			}),
			(b) => b[0],
			(b) => b[1],
		);

		for (const [origin, branches] of origins) {
			const result = await showOptionPicker({
				getTitle: () => "Execute command",
				getPlaceholder: () => `git push -d ${origin} ${branches.join(" ")}`,
				items: [],
				canSelectMany: false,
			});

			if (!result) continue;

			await this.repository.pushDelete(origin!, branches);
		}
	}

	public async cherryPick(commit: string, options?: CherryPickOptions) {
		const selected = await getCherryPickOptions();
		if (!selected) return;

		return await this.repository.cherryPick(commit, selected);
	}

	public async rebase(upstream: string, options?: RebaseOptions) {
		const selected = await getRebaseOptions(upstream, options);
		if (!selected) return;

		return await this.repository.rebase(upstream, selected);
	}

	public async merge(upstream: string, options?: MergeOptions) {
		const selected = await getMergeOptions(upstream, options);
		if (!selected) return;

		return await this.repository.merge(upstream, selected);
	}
}
