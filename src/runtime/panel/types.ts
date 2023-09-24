import { PanelState } from "../state/types";

export type Handler<T> = (
	action: T,
	getState: <T>(cb: (state: PanelState) => T) => T,
) => Promise<void> | void;
