import { collect, Mutex, Pylon } from "@alfonz/async";
import { GitCommit, GitRef, GitRefBranch } from "../../universal/git";
import { createGraphNodes, Graph } from "../GraphTabManager/createGraphNodes";
import { pipeThrough, take } from "../utils";
import { GitRepository } from "./git/GitRepository";
import vscode from "vscode";
import { GitResetMode } from "./git/commands/gitReset";
import { CherryPickOptions } from "./git/commands/gitCherryPick";

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

	async reset(mode: GitResetMode, treeish: string) {
		await this.repository.reset(mode, treeish);
	}

	async checkout(branch: string) {
		const localBranches = (await this.pylon.iterator.read()).refs
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
					"This branch already exists, do you want to checkout and:",
					{ modal: true },
					"Only checkout",
					"Try to pull",
					"Reset to remote",
				);

				switch (result) {
					case "Only checkout": {
						await this.repository.checkout(localName);
						await this.repository.pull();
						return;
					}
					case "Try to pull": {
						await this.repository.checkout(localName);
						await this.repository.pull();
						return;
					}
					case "Reset to remote": {
						await this.repository.checkout(localName);
						await this.repository.reset("hard", branch);
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

	public async deleteBranch(branch: string) {
		const state = await this.pylon.iterator.read();

		const ref = state.refs.find(
			(r): r is GitRefBranch => r.type === "branch" && r.name === branch,
		);

		if (!ref) {
			throw new Error("Branch does not exist");
		}

		if (ref.remote) {
			throw new Error("Trying to remove remote branch");
		}

		const result = await vscode.window.showWarningMessage(
			"Force delete?",
			{
				modal: true,
				detail:
					"Branch won't be removed if its commits are not referenced by other ref.",
			},
			"Yes",
			"No",
		);

		if (result === undefined) return;

		await this.repository.branchDelete(branch, result === "Yes" ? true : false);
	}

	public async deleteRemoteBranch(branch: string) {
		const [origin, ...rest] = branch.split("/");
		const branchName = rest.join("/");

		const result = await vscode.window.showWarningMessage(
			`Delete branch ${branchName} at ${origin}?`,
			{ modal: true },
			"Yes",
		);

		if (result === "Yes") {
			await this.repository.pushDelete(origin!, branchName);
		}
	}

	public async cherryPick(commit: string, options: CherryPickOptions) {
		return await this.repository.cherryPick(commit, options);
	}
}
