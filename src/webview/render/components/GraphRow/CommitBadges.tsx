import { branchMenuContext } from "../../../../universal/menuContext/branch";
import { bridge } from "../../../bridge";
import { GraphBadge } from "../../../state/toGraphBadges";
import { useBridgeMutation } from "../../useBridge/useBridgeMutation";
import { useAppContext } from "../AppContext";
import { RefBadge } from "../RefBadge";

export const CommitBadges = ({ badges }: { badges: GraphBadge[] }) => {
	const { repoPath, currentBranch } = useAppContext();
	const [checkout] = useBridgeMutation(bridge.checkout);

	return (
		<>
			{badges.map(
				(r, i) =>
					r.type !== "head" && (
						<RefBadge
							key={i}
							type={r.type}
							label={r.label}
							active={r.label === currentBranch}
							onClick={(e) => e.stopPropagation()}
							endDecorators={r.endDecorators?.map((d) => ({
								label: d,
								context:
									r.type === "branch" && repoPath
										? JSON.stringify(
												branchMenuContext("branch-remote", {
													repo: repoPath,
													branch: `${d}/${r.label}`,
												}),
										  )
										: undefined,
							}))}
							onDoubleClick={
								r.type === "branch"
									? async () => {
											await checkout(r.label);
									  }
									: undefined
							}
							context={
								r.type === "branch" && repoPath
									? JSON.stringify(
											!r.remoteOnlyBranch
												? branchMenuContext("branch", {
														repo: repoPath,
														branch: r.label,
												  })
												: branchMenuContext("branch-remote", {
														repo: repoPath,
														branch: r.label,
														remotes: r.endDecorators,
												  }),
									  )
									: undefined
							}
						/>
					),
			)}
		</>
	);
};
