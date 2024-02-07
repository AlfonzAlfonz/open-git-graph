import { Readable } from "stream";
import { toLineGenerator } from "./toLineGenerator";
import { buffer } from "../utils";

test("toLineGenerator", async () => {
	const input = `
a
b
c

d`;

	const readable = new Readable();
	readable.push(input);
	readable.push(null);

	const lines = await buffer(toLineGenerator(readable));

	expect(lines).toMatchObject(["", "a", "b", "c", "", "d"]);
});
