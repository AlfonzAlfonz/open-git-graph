import { render } from "./render/index.js";
import { receive } from "./state/index.js";

window.addEventListener("message", (event) => {
	receive(event.data);
});

render();
