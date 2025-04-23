import { describe, expect, it } from "bun:test";
import { Transaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionStatus } from "@/modules/transaction/src/domain/classes/transactionStatus";
import { TransactionType } from "@/modules/transaction/src/domain/classes/transactionType";
import {
	TRANSACTION_STATUS,
	TRANSACTION_TYPE,
} from "@/modules/transaction/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("Transaction", () => {
	const mockData = {
		id: new SnowflakeID(),
		senderId: new SnowflakeID(),
		sender: null,
		receiverId: new SnowflakeID(),
		receiver: null,
		amount: faker.number.float({ min: 1, max: Number.MAX_SAFE_INTEGER }),
		type: TransactionType.create(
			faker.helpers.arrayElement(Object.values(TRANSACTION_TYPE)),
		).getValue(),
		status: TransactionStatus.create(
			faker.helpers.arrayElement(Object.values(TRANSACTION_STATUS)),
		).getValue(),
		createdAt: new Date(),
	};

	it("should create a Transaction", () => {
		const transaction = Transaction.create(mockData);

		expect(transaction).toBeInstanceOf(Transaction);
		expect(transaction.id).toBe(mockData.id);
		expect(transaction.senderId).toBe(mockData.senderId);
		expect(transaction.sender).toBe(mockData.sender);
		expect(transaction.receiverId).toBe(mockData.receiverId);
		expect(transaction.receiver).toBe(mockData.receiver);
		expect(transaction.amount).toBe(mockData.amount);
		expect(transaction.type).toBe(mockData.type);
		expect(transaction.status).toBe(mockData.status);
		expect(transaction.createdAt.toString()).toBe(mockData.createdAt.toString());
	});
});
