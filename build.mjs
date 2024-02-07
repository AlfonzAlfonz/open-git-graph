// @ts-check
import * as esbuild from "esbuild";
import { fs, path } from "zx";
import { createProcessor } from "tailwindcss/lib/cli/build/plugin.js";

const prod = process.argv[2] === "-p";

prod && console.info("production build");

const [wv] = await Promise.all([
	await esbuild.build({
		bundle: true,
		entryPoints: ["src/webview/webview.ts"],
		outfile: "dist/webview.js",
		metafile: true,
		define: {
			"process.env.NODE_ENV": JSON.stringify(
				prod ? "production" : "development",
			),
		},
	}),
	await esbuild.build({
		bundle: true,
		entryPoints: ["src/runtime/runtime.ts"],
		outfile: "dist/runtime.cjs",
		external: ["vscode"],
		platform: "node",
		define: {
			WEBVIEW_HTML: `"${Buffer.from(
				fs.readFileSync("./src/webview/webview.html").toString("utf-8"),
			).toString("base64")}"`,
			"process.env.NODE_ENV": JSON.stringify(
				prod ? "production" : "development",
			),
		},
	}),
]);

await fs.writeFile("meta.json", JSON.stringify(wv.metafile));

await fs.copy(
	"./node_modules/@vscode/codicons/dist/codicon.ttf",
	"./dist/codicon.ttf",
);

(
	await createProcessor(
		{
			"--input": "./src/webview/styles/index.css",
			"--output": "./dist/output.css",
			"--postcss": "./postcss.config.cjs",
			...(prod ? { "--minify": true } : {}),
		},
		path.resolve("./tailwind.config.js"),
	)
)
	.build()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});

console.info("Success");
