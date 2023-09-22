/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/webview/**/*.ts",
		"./src/webview/**/*.tsx",
		"./webview.html",
	],
	theme: {
		extend: {},
	},
	plugins: [],
	corePlugins: {
		preflight: false,
	},
};
