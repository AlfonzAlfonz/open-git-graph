import { bridge } from "../../../bridge.js";
import { GraphTag } from "../../../state/toGraphTags.js";
import { useBridge } from "../../useBridge/useBridge.js";

export const CommitTags = ({ tags }: { tags: GraphTag[] }) => {
	const { data } = useBridge(bridge.getGraphData, []);

	return (
		<>
			{tags.map(
				(r) =>
					r.type !== "head" && (
						<div
							onDoubleClick={
								r.type === "branch"
									? () => {
											bridge.checkout(r.label);
									  }
									: undefined
							}
							className={`graph-tag ${r.type}`}
							data-vscode-context={
								r.type === "branch"
									? JSON.stringify({
											webviewSection: "branch",
											preventDefaultContextMenuItems: true,
											repo: data?.repoPath,
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
