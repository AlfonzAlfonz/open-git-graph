import { useWebviewStore } from "../../../state/index.js";
import { GraphTag } from "../../../state/toGraphTags.js";

export const CommitTags = ({ tags }: { tags: GraphTag[] }) => {
	const { dispatch } = useWebviewStore();

	return (
		<>
			{tags.map(
				(r) =>
					r.type !== "head" && (
						<div
							onDoubleClick={
								r.type === "branch"
									? () => {
											dispatch({ type: "CHECKOUT", branch: r.label });
									  }
									: undefined
							}
							className={`graph-tag ${r.type}`}
							data-vscode-context={
								r.type === "branch"
									? JSON.stringify({
											webviewSection: "branch",
											preventDefaultContextMenuItems: true,
											repo: window.__REPOSITORY,
											branch: r.label,
									  })
									: undefined
							}
						>
							<div className="content">{r.label}</div>
							{r.endDecorators?.map((d) => (
								<div className={"end-decorator"}>{d}</div>
							))}
						</div>
					),
			)}
		</>
	);
};
