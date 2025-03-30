import { describe, expect, it } from "bun:test";
import { WalletBalance } from "@/modules/wallet/src/domain/classes/walletBalance";
import { faker } from "@faker-js/faker";

describe("WalletBalance", () => {
	it("should successfully create a WalletBalance instance with a valid balance amount", () => {
		const balance = faker.number.int({
			min: WalletBalance.MINIMUM_BALANCE_AMOUNT,
			max: Number.MAX_SAFE_INTEGER,
		});
		const result = WalletBalance.create(balance);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(WalletBalance);
		expect(result.getValue().value).toBe(balance);
	});

	it("should return an error when creating a WalletBalance with invalid balance amount", () => {
		const balance = faker.number.int({
			min: Number.MIN_SAFE_INTEGER,
			max: WalletBalance.MINIMUM_BALANCE_AMOUNT - 1,
		});
		const result = WalletBalance.create(balance);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`Invalid balance amount. Balance must be greater than or equal to ${WalletBalance.MINIMUM_BALANCE_AMOUNT}.`,
		);
	});
});
