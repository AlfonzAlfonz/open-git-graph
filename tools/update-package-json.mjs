import fs from "fs/promises";
import semver from "semver";

const pkg = await fs
	.readFile("./package.json")
	.then((b) => JSON.parse(b.toString()));

console.log("Event name: ", process.env.GITHUB_EVENT_NAME);

switch (process.env.GITHUB_EVENT_NAME) {
	case "push": {
		if (process.env.GITHUB_REF_TYPE !== "tag") {
			console.log("Not tag, skipping");
			break;
		}

		const versionPrefix = "refs/tags/release/v";
		const ref = process.env.GITHUB_REF;
		if (!ref || !ref.startsWith(versionPrefix)) {
			throw new Error(`Invalid tag name ${process.env.GITHUB_REF}`);
		}
		pkg.version = ref.slice(versionPrefix.length);
		break;
	}
	case "pull_request": {
		if (!process.env.GITHUB_HEAD_REF || !process.env.GITHUB_RUN_NUMBER) {
			throw new Error("Invalid env");
		}

		pkg.version = semver.inc(
			pkg.version,
			"prerelease",
			process.env.GITHUB_HEAD_REF.replaceAll(/\W/g, "-") +
				`.${process.env.GITHUB_RUN_NUMBER}`,
			false,
		);
		break;
	}
	default:
		throw new Error(`Unknown event name ${process.env.GITHUB_EVENT_NAME}`);
}

await fs.writeFile("./package.json", JSON.stringify(pkg, null, "\t"));
