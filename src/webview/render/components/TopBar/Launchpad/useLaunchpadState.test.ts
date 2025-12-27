import { remainder } from "./useLaunchpadState";

test("remainder", () => {
	const input = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];

	expect(input.map((x) => remainder(x, 5))).toEqual([
		3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3,
	]);
});
