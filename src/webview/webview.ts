import { FromRuntimeMessage } from "../types/messages.js";
import { render } from "./render/index.js";
import { createState } from "./state/index.js";

const state = createState();

window.addEventListener("message", (event) => {
	state.dispatchMessage(event.data as FromRuntimeMessage);
});

state.eventTarget.addEventListener("render", (e) => {
	render(e.state);
});

state.dispatchEvent({ type: "INIT" });
