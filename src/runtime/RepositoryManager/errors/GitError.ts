import { GitProcessOutput } from "../git/commands/utils";

export class GitError extends Error {
	static throwOnFail([code, stderr, signals]: GitProcessOutput) {
		if (code !== null && code !== 0) {
			throw new GitError(
				stderr.trim() + ` (exit code ${code}${signals ? ` (${signals})` : ""})`,
			);
		}
	}
}
