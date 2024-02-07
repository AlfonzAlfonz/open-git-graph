import { groupBy } from "./groupBy";

test("groupBy", () => {
	const input = [
		{ key: "hello", value: "Hello" },
		{ key: "hello", value: "Hola" },
		{ key: "goodbye", value: "Goodbye" },
		{ key: "please", value: "Please" },
	];

	const result = groupBy(input, (e) => e.key);

	expect(Object.fromEntries(result.entries())).toMatchObject({
		hello: input.slice(0, 2),
		goodbye: input.slice(2, 3),
		please: input.slice(3, 4),
	});
});
