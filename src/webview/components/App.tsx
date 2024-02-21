import { errorToString } from "../../universal/errorToString";
import { WebToRuntimeBridge } from "../../universal/protocol";
import { ErrorBoundary } from "./ErrorBoundary";
import { GraphTable } from "./GraphTable";
import { LoadingModal } from "./LoadingModal";

export const App = ({ bridge }: { bridge: WebToRuntimeBridge }) => {
	return (
		<ErrorBoundary
			handle={async (e, errorInfo) => {
				console.error(e, errorInfo);
				await bridge.logError(errorToString(e));
				await bridge.logError(errorToString(errorInfo));
			}}
			fallback={
				<div className="w-[100vw] h-[100vh] flex items-center justify-center">
					<h1>Error happened :(</h1>
				</div>
			}
		>
			<LoadingModal>
				<GraphTable />
			</LoadingModal>
		</ErrorBoundary>
	);
};
