import { showOptionPicker } from "../showOptionPicker";
import { command } from "../utils";
import * as vscode from "vscode";

const items: vscode.QuickPickItem[] = [
	{
		label: "--no-commit",
		description: "Apply changes, but do not commit.",
	},
	{ label: "-x", description: "Record origin commit of the cherry pick." },
	{
		label: "--edit",
		description: "Edit commit message before committing.",
	},
];

export const cherryPickCommand = command({
	id: "open-git-graph.cherry-pick",
	command: (backend) => async (ctx) => {
		if (!isValidCtx(ctx)) {
			throw new Error("Invalid argument");
		}

		const repo = await backend.repositoryManager.getRepository(ctx.repo);

		if (!repo) {
			throw new Error("Repo not found");
		}

		const handle = backend.repositoryManager.getStateHandle(repo);

		const selected = await showOptionPicker({
			items,
			getTitle: () => "Execute command",
			getPlaceholder: (items) =>
				`git cherry-pick ${items.map((i) => i.label).join(" ")}`,
		});

		if (selected === undefined) return;

		const selectedKeys = selected.map((s) => s.label);

		await handle.cherryPick(ctx.ref, {
			noCommit: selectedKeys.includes("--no-commit"),
			recordOrigin: selectedKeys.includes("-x"),
			edit: selectedKeys.includes("--edit"),
		});
	},
});

const isValidCtx = (x: unknown): x is { ref: string; repo: string } =>
	!!x &&
	typeof x === "object" &&
	"ref" in x &&
	typeof x.ref === "string" &&
	"repo" in x &&
	typeof x.repo === "string";
