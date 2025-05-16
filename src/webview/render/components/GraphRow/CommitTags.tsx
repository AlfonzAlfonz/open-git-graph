import { bridge } from "../../../bridge";
import { GraphTag } from "../../../state/toGraphTags";
import { useBridgeMutation } from "../../useBridge/useBridgeMutation";
import { useAppContext } from "../AppContext";

export const CommitTags = ({ tags }: { tags: GraphTag[] }) => {
	const { repoPath } = useAppContext();
	const [checkout] = useBridgeMutation(bridge.checkout);

	return (
		<>
			{tags.map(
				(r) =>
					r.type !== "head" && (
						<div
							onClick={(e) => {
								e.stopPropagation();
							}}
							onDoubleClick={
								r.type === "branch"
									? async () => {
											await checkout(r.label);
									  }
									: undefined
							}
							className={`graph-tag ${r.type}`}
							data-vscode-context={
								r.type === "branch"
									? JSON.stringify({
											webviewSection: "branch",
											preventDefaultContextMenuItems: true,
											repo: repoPath,
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
