// export const getHtml = () => {
// 	const styleUri = panel.webview.asWebviewUri(
// 		vscode.Uri.joinPath(context.extensionUri, "dist", "output.css"),
// 	);
// 	const scriptUri = panel.webview.asWebviewUri(
// 		vscode.Uri.joinPath(context.extensionUri, "dist", "webview.js"),
// 	);

// 	let html = Buffer.from(webview, "base64").toString("utf-8");

// 	html = html.replace("${styleUri}", styleUri.toString());
// 	html = html.replace(
// 		"${scripts}",
// 		`<script src="${scriptUri.toString()}"></script>`,
// 	);
// };

// declare const WEBVIEW_HTML: string;
// const webview = WEBVIEW_HTML; // Value is replaced at build time
