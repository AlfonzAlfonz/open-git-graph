import { GitCommitFile, GitFileMode } from "../../../../universal/git";
import { bridge } from "../../../bridge";
import { useBridgeMutation } from "../../useBridge/useBridgeMutation";

export const CommitFileList = ({
	diff,
	files,
}: {
	diff: { a?: string; b?: string };
	files: GitCommitFile[];
}) => {
	const [showDiff] = useBridgeMutation(bridge.showDiff);

	return (
		<ul className="files list-none">
			{files.map((f) => (
				<li
					key={f.path}
					onClick={() => showDiff(f.path, diff.a, diff.b)}
					className={`flex gap-2 py-1 ${
						fileModeColors[f.mode] ?? "white"
					} cursor-pointer`}
				>
					<div className="flex relative w-full items-center gap-1">
						<span className="codicon codicon-file" />
						<span>{f.path}</span>
						<span className="absolute right-0">{f.mode}</span>
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
