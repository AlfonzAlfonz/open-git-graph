const debug = document.getElementById("debug")!;
export const log = (...args: any[]) => {
	debug.textContent += JSON.stringify(args) + "\n";
};
