import { GitCommitFile, GitFileMode } from "../../../../universal/git";
import { useWebviewStore } from "../../../state";

export const CommitFileList = ({
	diff,
	files,
}: {
	diff: { a?: string; b?: string };
	files: GitCommitFile[];
}) => {
	const { dispatch } = useWebviewStore();

	return (
		<ul class="files list-none">
			{files.map((f, i) => (
				<li
					key={f.path}
					onClick={() =>
						dispatch({
							type: "SHOW_DIFF",
							path: f.path,
							...diff,
						})
					}
					class={`flex gap-2 py-1 ${
						fileModeColors[f.mode] ?? "white"
					} cursor-pointer`}
				>
					<div class="flex justify-between w-full">
						<span>{f.path}</span>
						<span class="px-1">{f.mode}</span>
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
