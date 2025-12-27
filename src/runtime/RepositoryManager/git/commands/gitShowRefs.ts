import {
	BRANCH_PREFIX,
	getPrefixedId,
	GitRef,
	GitRefFullname,
	REMOTE_BRANCH_PREFIX,
	TAG_PREFIX,
} from "../../../../universal/git";
import { toLineGenerator } from "../toLineGenerator";
import { GitCommand } from "./utils";

export const gitShowRefs = () =>
	({
		args: ["show-ref", "--head", "--dereference"],
		parse: async function (stdout) {
			const lines = toLineGenerator(stdout);

			const refs = new Map<GitRefFullname | "head", GitRef>();

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
					const fullname = getPrefixedId(TAG_PREFIX, name);
					const prev = refs.get(fullname);
					if (prev) {
						continue;
					}
					refs.set(fullname, {
						hash,
						fullname,
						type: "tag",
						name: name.slice(TAG_PREFIX.length),
					});
				}
				if (name.startsWith(TAG_PREFIX) && name.endsWith("^{}")) {
					const fullname = getPrefixedId(TAG_PREFIX, name);
					refs.set(fullname, {
						hash,
						fullname,
						type: "tag",
						name: name.slice(TAG_PREFIX.length, -3),
					});
				}

				if (name.startsWith(BRANCH_PREFIX)) {
					const fullname = getPrefixedId(BRANCH_PREFIX, name);
					refs.set(fullname, {
						hash,
						fullname,
						type: "branch",
						name: name.slice(BRANCH_PREFIX.length),
					});
				}
				if (name.startsWith(REMOTE_BRANCH_PREFIX)) {
					const fullname = getPrefixedId(REMOTE_BRANCH_PREFIX, name);
					const [remote, ...b] = name
						.slice(REMOTE_BRANCH_PREFIX.length)
						.split("/");
					refs.set(fullname, {
						hash,
						fullname,
						type: "branch",
						name: b.join("/"),
						remote,
					});
				}
			}

			return refs;
		},
	}) satisfies GitCommand<Promise<Map<GitRefFullname | "head", GitRef>>>;
