import { Readable } from "stream";
import { toLineGenerator } from "./toLineGenerator";
import { collect } from "asxnc/collect";

test("toLineGenerator", async () => {
	const input = `
a
b
c

d`;

	const readable = new Readable();
	readable.push(input);
	readable.push(null);

	const lines = await collect(toLineGenerator(readable));

	expect(lines).toMatchObject(["", "a", "b", "c", "", "d"]);
});
