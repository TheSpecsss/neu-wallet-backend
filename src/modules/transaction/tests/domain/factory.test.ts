import { beforeEach, describe, expect, it } from "bun:test";
import { Transaction } from "@/modules/transaction/src/domain/classes/transaction";
import {
	type ITransactionFactory,
	TransactionFactory,
} from "@/modules/transaction/src/domain/factory";
import {
	TRANSACTION_STATUS,
	TRANSACTION_TYPE,
} from "@/modules/transaction/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("TransactionFactory", () => {
	let mockData: ITransactionFactory;

	beforeEach(() => {
		mockData = {
			id: new SnowflakeID().toString(),
			senderId: new SnowflakeID().toString(),
			receiverId: new SnowflakeID().toString(),
			amount: faker.number.float({ min: 1, max: Number.MAX_SAFE_INTEGER }),
			type: faker.helpers.arrayElement(Object.values(TRANSACTION_TYPE)),
			status: faker.helpers.arrayElement(Object.values(TRANSACTION_STATUS)),
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
		expect(user.amount).toBe(mockData.amount);
		expect(user.typeValue).toBe(mockData.type);
		expect(user.statusValue).toBe(mockData.status);
		expect(user.createdAt.toString()).toBe(mockData.createdAt.toString());
	});

	it("should fail when transaction type is invalid type", () => {
		const invalidTypeProps = { ...mockData, type: "invalid-transaction-type" };

		const result = TransactionFactory.create(invalidTypeProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(`${invalidTypeProps.type} is invalid transaction type`);
	});
});
