// @ts-check
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import swc from "@rollup/plugin-swc";
import fs from "fs";
import path from "path";
import { rollup } from "rollup";
import { createProcessor } from "tailwindcss/lib/cli/build/plugin.js";
import alias from "@rollup/plugin-alias";

const prod = process.argv[2] === "-p";

prod && console.info("production build");

/** @type {import("@rollup/plugin-swc/src").Options} */
const swcOptions = {
	swc: {
		jsc: {
			parser: {
				syntax: "typescript",
				tsx: true,
			},
			transform: {
				react: {
					runtime: "automatic",
					importSource: "react",
				},
			},
			minify: {
				compress: true,
				mangle: true,
			},
		},
		minify: prod,
	},
};

/** @type {import("rollup").RollupOptions} */
const webview = {
	input: "src/webview/webview.ts",
	output: {
		file: "./dist/webview.js",
		compact: prod,
		format: /** @type {"cjs"} */ ("cjs"),
	},
	plugins: [
		replace({
			values: {
				"process.env.NODE_ENV": JSON.stringify(
					prod ? "production" : "development",
				),
			},
		}),
		commonjs({}),
		nodeResolve({ extensions: [".js", ".jsx", ".ts", ".tsx"] }),
		swc(swcOptions),
	],
};

/** @returns {import("rollup").RollupOptions} */
const runtime = () => ({
	input: "src/runtime/runtime.ts",
	external: ["vscode"],
	output: {
		file: "dist/runtime.js",
		compact: prod,
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
				"process.env.NODE_ENV": JSON.stringify(
					prod ? "production" : "development",
				),
			},
		}),
		swc(swcOptions),
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

await build(webview).catch((e) => {
	console.info("failed webview");
	console.error(e);
	process.exit(1);
});

await build(runtime()).catch((e) => {
	console.info("failed runtime");
	console.error(e);
	process.exit(1);
});

console.info("Success");

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
