import { collect, Mutex, Pylon } from "@alfonz/async";
import vscode from "vscode";
import { GitCommit, GitRef, GitRefBranch } from "../../universal/git";
import { groupBy } from "../../universal/groupBy";
import { createGraphNodes, Graph } from "../GraphTabManager/createGraphNodes";
import { pipeThrough, take } from "../utils";
import { DeleteBranchOptions } from "./git/commands/gitBranchDelete";
import { CherryPickOptions } from "./git/commands/gitCherryPick";
import { GitResetOptions } from "./git/commands/gitReset";
import { GitRepository } from "./git/GitRepository";
import { getCherryPickOptions } from "./options/getCherryPickOptions";
import { getDeleteBranchOptions } from "./options/getDeleteBranchOptions";
import { getResetOptions } from "./options/getResetOptions";

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
				const result = await vscode.window.showWarningMessage(
					"This branch already exists, do you want to:",
					{ modal: true },
					"Checkout",
					"Checkout & pull",
					"Checkout & reset",
				);

				switch (result) {
					case "Checkout": {
						await this.repository.checkout(localName);
						await this.repository.pull();
						return;
					}
					case "Checkout & pull": {
						await this.repository.checkout(localName);
						await this.repository.pull();
						return;
					}
					case "Checkout & reset": {
						await this.repository.checkout(localName);
						await this.reset(branch, { mode: "hard" });
						return;
					}
					default: {
						return;
					}
				}
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

		if (!ref) {
			throw new Error("Branch does not exist");
		}

		if (ref.remote) {
			throw new Error("Trying to remove remote branch");
		}

		if (!options) {
			const selected = await getDeleteBranchOptions(branch);
			if (!selected) return;
			options = selected;
		}

		await this.repository.branchDelete(branch, options);

		if (options.remotes) {
			await this.deleteRemoteBranches(remotes.map((r) => `${r}/${branch}`));
			for (const r of remotes) {
			}
		}
	}

	public async deleteRemoteBranches(
		branches: string[],
		skipConfirm: boolean = false,
	) {
		if (skipConfirm) {
			const result = await vscode.window.showWarningMessage(
				`Delete branch ${branches.join(", ")}?`,
				{ modal: true },
				"Yes",
			);

			if (result !== "Yes") return;
		}

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
			await this.repository.pushDelete(origin!, branches);
		}
	}

	public async cherryPick(commit: string, options?: CherryPickOptions) {
		if (!options) {
			const selected = await getCherryPickOptions();
			if (!selected) return;
			options = selected;
		}

		return await this.repository.cherryPick(commit, options);
	}
}
