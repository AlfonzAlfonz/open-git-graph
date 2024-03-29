import { bridge } from "../../../bridge";
import { GraphTag } from "../../../state/toGraphTags";
import { invalidate, useBridge } from "../../useBridge/useBridge";
import { useBridgeMutation } from "../../useBridge/useBridgeMutation";

export const CommitTags = ({ tags }: { tags: GraphTag[] }) => {
	const { data } = useBridge(bridge.getGraphData, []);
	const checkout = useBridgeMutation(bridge.checkout);

	return (
		<>
			{tags.map(
				(r) =>
					r.type !== "head" && (
						<div
							onDoubleClick={
								r.type === "branch"
									? async () => {
											await checkout.mutateAsync([r.label]);
											await invalidate(bridge.getGraphData, []);
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
