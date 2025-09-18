import { createTestClientServerBridge } from "./_utils.test";

class TestBridge {
	async resolvesTo5(): Promise<5> {
		return 5;
	}

	async rejects() {
		throw new Error("Rejected");
	}
}

test("should setup client server bridge", async () => {
	const [bridge] = createTestClientServerBridge(new TestBridge());

	await expect(bridge.resolvesTo5()).resolves.toBe(5);
	await expect(bridge.rejects()).rejects.toBeInstanceOf(Error);
});
