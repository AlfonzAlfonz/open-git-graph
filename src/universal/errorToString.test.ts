import { errorToString } from "./errorToString";

test("errorToString", () => {
	const err = new Error("test message");
	const obj = { message: "test message" };
	const instance = new AbortController();

	expect(errorToString(err)).toBe(
		`Error occurred:
  test message
  ${err.stack}`.trim(),
	);

	expect(errorToString(obj)).toBe(
		`Error occurred:
  [object Object]
  {"message":"test message"}`.trim(),
	);

	expect(errorToString(instance)).toBe(
		`Error occurred:
  [object AbortController]
  {}`.trim(),
	);
});
