import { describe, expect, it } from "bun:test";
import { TransactionStatus } from "@/modules/transaction/src/domain/classes/transactionStatus";
import { TRANSACTION_STATUS } from "@/modules/transaction/src/domain/shared/constant";
import { faker } from "@faker-js/faker";

describe("TransactionStatus", () => {
	it("should successfully create a TransactionStatus instance with a valid status", () => {
		const status = faker.helpers.arrayElement(Object.values(TRANSACTION_STATUS));
		const result = TransactionStatus.create(status);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(TransactionStatus);
		expect(result.getValue().value).toBe(status);
	});

	it("should return an error when creating a TransactionStatus with an invalid status", () => {
		const status = "invalid-transaction-status";
		const result = TransactionStatus.create(status);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(`${status} is invalid transaction status`);
	});
});
