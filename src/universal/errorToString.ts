export const errorToString = (e: unknown) => {
	if (typeof e === "object" && e instanceof Error) {
		return `
Error occurred:
  ${e.message}
  ${e.stack}
`.trim();
	}

	return `
Error occurred:
  ${
		typeof e === "object" && e && ("toString" in e || Symbol.toStringTag in e)
			? String(e)
			: ""
	}
  ${tryStringify(e)}
`.trim();
};

const tryStringify = (e: unknown) => {
	try {
		return JSON.stringify(e);
	} catch {
		return "{ not stringifyable ) }";
	}
};
