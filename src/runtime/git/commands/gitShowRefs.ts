import { GitRef } from "../../../universal/git";
import { toLineGenerator } from "../toLineGenerator";
import { GitCommand } from "./utils";

export const gitShowRefs = (): GitCommand<AsyncIterable<GitRef>> => {
	return {
		args: ["show-ref", "--head", "--dereference"],
		parse: async function* (stdout) {
			const lines = toLineGenerator(stdout);

			while (true) {
				const { value: ln, done } = await lines.next();

				if (done) return;

				const [hash, name] = ln.split(" ") as [string, string];

				if (name === "HEAD") {
					yield {
						hash,
						type: "head",
					};
				}
				if (name.startsWith(TAG_PREFIX) && name.endsWith("^{}")) {
					yield {
						hash,
						type: "tag",
						name: name.slice(TAG_PREFIX.length, -3),
					};
				}
				if (name.startsWith(BRANCH_PREFIX)) {
					yield {
						hash,
						type: "branch",
						name: name.slice(BRANCH_PREFIX.length),
					};
				}
				if (name.startsWith(REMOTE_BRANCH_PREFIX)) {
					const [remote, ...b] = name
						.slice(REMOTE_BRANCH_PREFIX.length)
						.split("/");
					yield {
						hash,
						type: "branch",
						name: b.join("/"),
						remote,
					};
				}
			}
		},
	};
};

const TAG_PREFIX = "refs/tags/";
const BRANCH_PREFIX = "refs/heads/";
const REMOTE_BRANCH_PREFIX = "refs/remotes/";
