import { describe, expect, it } from "bun:test";
import { TransactionAmount } from "@/modules/transaction/src/domain/classes/transactionAmount";
import { faker } from "@faker-js/faker";

describe("TransactionAmount", () => {
	it("should successfully create a TransactionAmount instance with a valid amount", () => {
		const amount = faker.number.float({ min: TransactionAmount.MINIMUM_AMOUNT });
		const result = TransactionAmount.create(amount);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(TransactionAmount);
		expect(result.getValue().value).toBe(amount);
	});

	it("should return an error when creating a TransactionAmount with invalid amount", () => {
		const amount = faker.number.float({
			min: Number.MIN_SAFE_INTEGER,
			max: TransactionAmount.MINIMUM_AMOUNT - 1,
		});
		const result = TransactionAmount.create(amount);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`Invalid transaction amount. Amount must be at least ${TransactionAmount.MINIMUM_AMOUNT}.`,
		);
	});
});
