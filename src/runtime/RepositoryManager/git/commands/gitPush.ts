import { GitError } from "../../errors/GitError";
import { GitCommand } from "./utils";

export type PushOptions = {
	forceWithLease: boolean;
	force?: boolean;
};

export const gitPush = (
	remote: string,
	refspec: string | string[],
	{ forceWithLease, force }: PushOptions,
): GitCommand<Promise<void>> => ({
	args: [
		"push",
		force ? "--force" : null,
		forceWithLease ? "--force-with-lease" : null,
		remote,
		...(typeof refspec === "string" ? [refspec] : refspec),
	],
	async parse(_, p) {
		GitError.throwOnFail(await p);
	},
});
