// @ts-check
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import swc from "@rollup/plugin-swc";
import fs from "fs";
import path from "path";
import { rollup } from "rollup";
import { createProcessor } from "tailwindcss/lib/cli/build/plugin.js";

const webview = {
	input: "src/webview/webview.ts",
	output: {
		file: "./dist/webview.js",
		format: /** @type {"cjs"} */ ("cjs"),
	},
	plugins: [nodeResolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }), swc()],
};

const runtime = () => ({
	input: "src/runtime/runtime.ts",
	output: {
		file: "dist/runtime.js",
		format: /** @type {"cjs"} */ ("cjs"),
	},
	plugins: [
		nodeResolve({
			extensions: [".js", ".jsx", ".ts", ".tsx"],
		}),
		replace({
			preventAssignment: true,
			values: {
				WEBVIEW_HTML: Buffer.from(
					fs.readFileSync("./src/webview/webview.html").toString("utf-8"),
				).toString("base64"),
			},
		}),
		swc(),
	],
});

fs.cpSync(
	"./node_modules/@vscode/codicons/dist/codicon.ttf",
	"./dist/codicon.ttf",
	{ recursive: true },
);

(
	await createProcessor(
		{
			"--input": "./src/webview/styles/index.css",
			"--output": "./dist/output.css",
			"--postcss": "./postcss.config.js",
		},
		path.resolve("./tailwind.config.js"),
	)
)
	.build()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	});

await build(webview).catch(() => {
	console.log("failed webview");
	process.exit(1);
});

await build(runtime()).catch(() => {
	console.log("failed runtime");
	process.exit(1);
});

console.log("Success");

/**
 *
 * @param {import("rollup").RollupOptions} input
 * @returns
 */
async function build(input) {
	let bundle = await rollup(input);
	const o = [input.output].flat()[0];

	if (!o?.file) {
		throw new Error("No output");
	}

	const code = await bundle.generate(o);
	fs.mkdirSync(path.dirname(o.file), { recursive: true });
	fs.writeFileSync(path.resolve(o.file), code.output[0].code, {});

	if (bundle) {
		await bundle.close();
	}
}
