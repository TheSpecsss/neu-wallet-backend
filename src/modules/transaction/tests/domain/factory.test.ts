import { beforeEach, describe, expect, it } from "bun:test";
import { Transaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionAmount } from "@/modules/transaction/src/domain/classes/transactionAmount";
import {
	type ITransactionFactory,
	TransactionFactory,
} from "@/modules/transaction/src/domain/factory";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("TransactionFactory", () => {
	let mockData: ITransactionFactory;

	beforeEach(() => {
		mockData = {
			id: new SnowflakeID().toString(),
			senderId: new SnowflakeID().toString(),
			receiverId: new SnowflakeID().toString(),
			amount: faker.number.float({ min: TransactionAmount.MINIMUM_AMOUNT }),
			type: faker.helpers.arrayElement(Object.values(TRANSACTION_TYPE)),
			createdAt: faker.date.past(),
		};
	});

	it("should successfully create a Transaction when all properties are valid", () => {
		const result = TransactionFactory.create(mockData);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(Transaction);

		const user = result.getValue();
		expect(user.idValue).toBe(mockData.id!);
		expect(user.senderIdValue).toBe(mockData.senderId);
		expect(user.receiverIdValue).toBe(mockData.receiverId);
		expect(user.amountValue).toBe(mockData.amount);
		expect(user.typeValue).toBe(mockData.type);
		expect(user.createdAt.toString()).toBe(mockData.createdAt.toString());
	});

	it("should fail if amount is less than the minimum value", () => {
		const invalidAmountProps = {
			...mockData,
			amount: faker.number.float({
				min: Number.MIN_SAFE_INTEGER,
				max: TransactionAmount.MINIMUM_AMOUNT - 1,
			}),
		};

		const result = TransactionFactory.create(invalidAmountProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`Invalid transaction amount. Amount must be at least ${TransactionAmount.MINIMUM_AMOUNT}.`,
		);
	});

	it("should fail when transaction type is invalid type", () => {
		const invalidTypeProps = { ...mockData, type: "invalid-transaction-type" };

		const result = TransactionFactory.create(invalidTypeProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(`${invalidTypeProps.type} is invalid transaction type`);
	});
});
