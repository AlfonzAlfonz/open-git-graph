import { bridge } from "../../../bridge";
import { GraphTag } from "../../../state/toGraphTags";
import { useBridgeMutation } from "../../useBridge/useBridgeMutation";
import { useAppContext } from "../AppContext";

export const CommitTags = ({ tags }: { tags: GraphTag[] }) => {
	const { repoPath, currentBranch } = useAppContext();
	const [checkout] = useBridgeMutation(bridge.checkout);

	return (
		<>
			{tags.map(
				(r, i) =>
					r.type !== "head" && (
						<div
							key={i}
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
							className={`graph-tag ${r.type} ${
								r.label === currentBranch ? "active" : ""
							}`}
							data-vscode-context={
								r.type === "branch"
									? r.remoteOnlyBranch
										? JSON.stringify({
												webviewSection: "branch-remote",
												preventDefaultContextMenuItems: true,
												repo: repoPath,
												branch: r.label,
										  })
										: JSON.stringify({
												webviewSection: "branch",
												preventDefaultContextMenuItems: true,
												repo: repoPath,
												branch: r.label,
										  })
									: undefined
							}
						>
							<div className="content">{r.label}</div>
							{r.endDecorators?.map((d, i) => (
								<div
									key={i}
									className={"end-decorator"}
									data-vscode-context={
										r.type === "branch"
											? JSON.stringify({
													webviewSection: "branch-remote",
													preventDefaultContextMenuItems: true,
													repo: repoPath,
													branch: `${d}/${r.label}`,
											  })
											: undefined
									}
								>
									{d}
								</div>
							))}
						</div>
					),
			)}
		</>
	);
};
