import { createRoot } from "react-dom/client";
import { App } from "./App";
import { GraphTable } from "./components/GraphTable";
import { LoadingModal } from "./components/LoadingModal";
import { AppContext } from "./contexts/AppContext";

export const render = () => {
	createRoot(document.querySelector("#root")!).render(<Root />);
};

const Root = () => {
	return (
		<AppContext>
			<App>
				<LoadingModal>
					<GraphTable />
				</LoadingModal>
			</App>
		</AppContext>
	);
};
