import { GitProcessOutput } from "../git/commands/utils";

export class GitError extends Error {
	static throwOnFail([code, stderr, signals]: GitProcessOutput) {
		if (code !== null && code !== 0) {
			const lines = stderr
				.trim()
				.split("\n")
				.filter((ln) => !ln.startsWith("hint:"));

			throw new GitError(
				lines.join("\n") +
					` (exit code ${code}${signals ? ` (${signals})` : ""})`,
			);
		}
	}
}
