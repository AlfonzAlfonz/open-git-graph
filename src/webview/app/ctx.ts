import { DI, di } from "../../universal/di/di";
import { renderService } from "../components/render";
import { RuntimeService, runtimeService } from "./runtime";

export interface WebviewServices {
	runtime: RuntimeService;
}

export type WebviewCtx = DI<WebviewServices>;

export const createWebviewCtx = () =>
	di<WebviewServices>({
		runtime: runtimeService,
	});
