import { branchMenuContext } from "../../../../universal/menuContext/branch";
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
								repoPath &&
								JSON.stringify(
									!r.remoteOnlyBranch
										? branchMenuContext("branch", {
												repo: repoPath!,
												branch: r.label,
										  })
										: branchMenuContext("branch-remote", {
												repo: repoPath,
												branch: r.label,
												remotes: r.endDecorators,
										  }),
								)
							}
						>
							<div className="content">{r.label}</div>
							{r.endDecorators?.map((d, ii) => (
								<div
									key={ii}
									className={"end-decorator"}
									data-vscode-context={
										r.type === "branch" && repoPath
											? JSON.stringify(
													branchMenuContext("branch-remote", {
														repo: repoPath,
														branch: `${d}/${r.label}`,
													}),
											  )
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
