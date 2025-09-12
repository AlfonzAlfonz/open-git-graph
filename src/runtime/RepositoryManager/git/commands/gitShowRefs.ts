import { GitRef } from "../../../../universal/git";
import { toLineGenerator } from "../toLineGenerator";
import { GitCommand } from "./utils";

export const gitShowRefs = () =>
	({
		args: ["show-ref", "--head", "--dereference"],
		parse: async function (stdout) {
			const lines = toLineGenerator(stdout);

			const refs = new Map<string, GitRef>();

			while (true) {
				const { value: ln, done } = await lines.next();

				if (done) break;

				const [hash, name] = ln.split(" ") as [string, string];

				if (name === "HEAD") {
					refs.set("head", {
						hash,
						type: "head",
					});
				}
				if (name.startsWith(TAG_PREFIX) && !name.endsWith("^{}")) {
					const prev = refs.get(name);
					if (prev) {
						continue;
					}
					refs.set(name, {
						hash,
						type: "tag",
						name: name.slice(TAG_PREFIX.length),
					});
				}
				if (name.startsWith(TAG_PREFIX) && name.endsWith("^{}")) {
					refs.set(name.slice(0, -3), {
						hash,
						type: "tag",
						name: name.slice(TAG_PREFIX.length, -3),
					});
				}

				if (name.startsWith(BRANCH_PREFIX)) {
					refs.set(name, {
						hash,
						type: "branch",
						name: name.slice(BRANCH_PREFIX.length),
					});
				}
				if (name.startsWith(REMOTE_BRANCH_PREFIX)) {
					const [remote, ...b] = name
						.slice(REMOTE_BRANCH_PREFIX.length)
						.split("/");
					refs.set(name, {
						hash,
						type: "branch",
						name: b.join("/"),
						remote,
					});
				}
			}

			return refs.values();
		},
	}) satisfies GitCommand<Promise<IterableIterator<GitRef>>>;

const TAG_PREFIX = "refs/tags/";
const BRANCH_PREFIX = "refs/heads/";
const REMOTE_BRANCH_PREFIX = "refs/remotes/";
