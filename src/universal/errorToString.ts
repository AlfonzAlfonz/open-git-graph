export const errorToString = (e: unknown) => {
	if (typeof e === "object" && e instanceof Error) {
		return `
Error occured
  ${e.message}
  ${e.stack}
  ${tryStringify(e)}
    `;
	}

	return `
Error occured
  ${
		typeof e === "object" && e && ("toString" in e || Symbol.toStringTag in e)
			? String(e)
			: ""
	}
  ${tryStringify(e)}
`;
};

const tryStringify = (e: unknown) => {
	try {
		return JSON.stringify(e);
	} catch {
		return "{ not stringifiable ) }";
	}
};
