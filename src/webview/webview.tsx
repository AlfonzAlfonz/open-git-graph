import { createRoot } from "react-dom/client";
import { createWebviewCtx } from "./app/ctx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./components/useBridge/useBridge";
import { App } from "./components/App";

const ctx = createWebviewCtx();

ctx.inject(["runtime"], async ({ runtime }) => {
	const root = createRoot(document.querySelector("#root")!);

	root.render(
		<QueryClientProvider client={queryClient}>
			<App bridge={runtime} />
		</QueryClientProvider>,
	);
});
