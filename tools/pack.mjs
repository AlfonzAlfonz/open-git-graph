import child_process from "child_process";
import fs from "fs/promises";
import path from "path";

await fs.rm("./build", { recursive: true, force: true });

await fs.mkdir("./build");

await fs.cp("./dist", "./build/dist", { recursive: true });
await fs.cp("./assets", "./build/assets", { recursive: true });
await fs.cp("./LICENSE", "./build/LICENSE");
await fs.rename("./build/dist/runtime.cjs", "./build/dist/runtime.js");
const { scripts, devDependencies, type, ...pkg } = await fs
	.readFile("./package.json")
	.then((b) => JSON.parse(b.toString()));

pkg.main = "./dist/runtime.js";

await fs.writeFile("./build/package.json", JSON.stringify(pkg, null, "\t"));

await new Promise((resolve, reject) => {
	const child = child_process.spawn("pnpx vsce package", {
		shell: true,
		cwd: path.resolve("build"),
	});

	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);

	child.on("exit", (code) => {
		if (code) {
			return reject(new Error(`Exited with code ${code}`));
		}
		return resolve(undefined);
	});
});
