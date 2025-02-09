import { describe, expect, it } from "bun:test";
import { TransactionType } from "@/modules/transaction/src/domain/classes/transactionType";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { faker } from "@faker-js/faker";

describe("TransactionType", () => {
	it("should successfully create a TransactionType instance with a valid type", () => {
		const type = faker.helpers.arrayElement(Object.values(TRANSACTION_TYPE));
		const result = TransactionType.create(type);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(TransactionType);
		expect(result.getValue().value).toBe(type);
	});

	it("should return an error when creating a TransactionType with an invalid type", () => {
		const type = "invalid-transaction-type";
		const result = TransactionType.create(type);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(`${type} is invalid transaction type`);
	});
});
