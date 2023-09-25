import { render } from "./render/index.js";
import { receive } from "./state/index.js";

declare global {
	interface Window {
		__REPOSITORY: string;
	}
}

window.addEventListener("message", (event) => {
	receive(event.data);
});

render();
