import * as asxnc from "asxnc";
import { di } from "./di";

test("example", async () => {
	interface TServices {
		db: { db: true };
		repository: { repository: true };
	}

	const ctx = di<TServices>();

	const result: Partial<TServices> = {};

	await asxnc.fork(
		ctx.inject(["db", "repository"], async ({ db, repository }) => {
			result.db = db;
			result.repository = repository;
		}),
		ctx.service("db", [], () => {
			return { db: true };
		}),
		ctx.service("repository", ["db"], () => {
			return { repository: true };
		}),
	);

	expect(result.db).toMatchObject({ db: true });
	expect(result.repository).toMatchObject({ repository: true });
});
