import { catchErrors } from "./handleError";

describe("catchErrors", () => {
	test("should prevent throw", async () => {
		const errors: unknown[] = [];
		const errorHandler = (e: unknown) => {
			errors.push(e);
		};
		const input = async (a: number, b: number) => {
			throw new Error("test");
		};

		await catchErrors(input, errorHandler)(1, 4);

		expect(errors[0]).toBeTruthy();
		expect((errors[0] as Error).message).toBe("test");
	});
});
