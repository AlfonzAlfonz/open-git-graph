import * as vscode from "vscode";
import { RuntimeCtx, createRuntimeCtx } from "./app/ctx";

let ctx: RuntimeCtx;

export function activate(context: vscode.ExtensionContext) {
	ctx = createRuntimeCtx(context);

	const d = vscode.commands.registerCommand(
		"open-git-graph.graph",
		async () => {
			await ctx.ready;
			ctx.getSync("graphPanels").events.dispatch({ value: ["open", {}] });
		},
	);

	ctx.active.then(() => {
		d.dispose();
	});

	// ensureLogger().appendLine("Activating extension");

	// const store = lazyRuntimeStore();

	// context.subscriptions.push(
	// 	vscode.workspace.registerTextDocumentContentProvider(
	// 		ShowFileTextDocumentContentProvider.scheme,
	// 		new ShowFileTextDocumentContentProvider(store),
	// 	),
	// );

	// const commands = [
	// 	graphCommand,
	// 	mergeHeadCommand,
	// 	rebaseHeadCommand,
	// 	resetHeadCommand,
	// 	checkoutCommand,
	// ];

	// for (const c of commands) {
	// 	context.subscriptions.push(
	// 		vscode.commands.registerCommand(
	// 			c.id,
	// 			catchErrors(c.command(context, store)),
	// 		),
	// 	);
	// }
}

export function deactivate() {
	console.log("deactivate");
	ctx.dispose();
}
