/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/webview/**/*.ts", "./webview.html"],
	theme: {
		extend: {},
	},
	plugins: [],
	corePlugins: {
		preflight: false,
	},
};
