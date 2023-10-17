import { GitCommitFile, GitFileMode } from "../../../../universal/git";
import { bridge } from "../../../bridge";

export const CommitFileList = ({
	diff,
	files,
}: {
	diff: { a?: string; b?: string };
	files: GitCommitFile[];
}) => {
	return (
		<ul className="files list-none">
			{files.map((f, i) => (
				<li
					key={f.path}
					onClick={() => bridge.showDiff(f.path, diff.a, diff.b)}
					className={`flex gap-2 py-1 ${
						fileModeColors[f.mode] ?? "white"
					} cursor-pointer`}
				>
					<div className="flex justify-between w-full">
						<span>{f.path}</span>
						<span className="px-1">{f.mode}</span>
					</div>
				</li>
			))}
		</ul>
	);
};

const fileModeColors: Record<GitFileMode, string> = {
	M: "modified",
	T: "type-modified",
	A: "added",
	D: "deleted",
	R: "renamed",
	C: "copied",
	U: "updated",
	"!": "ignored",
	"?": "untracked",
};
