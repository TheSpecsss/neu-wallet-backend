import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import type { ITransactionRawObject } from "@/modules/transaction/src/domain/shared/constant";
import {
	type ITransactionRepository,
	TransactionRepository,
} from "@/modules/transaction/src/repositories/transactionRepository";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { db } from "@/shared/infrastructure/database";

const assertTransaction = (value: ITransaction | null, expectedValue: ITransactionRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.senderIdValue).toBe(expectedValue.senderId);
	expect(value!.receiverIdValue).toBe(expectedValue.receiverId);
	expect(value!.amountValue).toBe(expectedValue.amount.toNumber());
	expect(value!.typeValue).toBe(expectedValue.type);
};

describe("Test Transaction Repository findTransactionsByIds", () => {
	let transactionRepository: ITransactionRepository;

	beforeAll(async () => {
		transactionRepository = new TransactionRepository();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	const seedTransactionWithUserAndWallet = async () => {
		const seededSenderWallet = await seedWallet();
		const seededReceiverWallet = await seedWallet();

		const seededSender = await seedUser({ walletId: seededSenderWallet.id });
		const seededReceiver = await seedUser({ walletId: seededReceiverWallet.id });

		return await seedTransaction({
			senderId: seededSender.id,
			receiverId: seededReceiver.id,
		});
	};

	it("should retrieve a transactions by ids", async () => {
		const seededTransactionOne = await seedTransactionWithUserAndWallet();
		const seededTransactionTwo = await seedTransactionWithUserAndWallet();

		const transactions = await transactionRepository.findTransactionsByIds([
			seededTransactionOne.id,
			seededTransactionTwo.id,
		]);

		expect(transactions).toHaveLength(2);
		assertTransaction(transactions[0], seededTransactionOne);
		assertTransaction(transactions[1], seededTransactionTwo);
	});

	it("should only retrieve existing transactions", async () => {
		const seededTransactionOne = await seedTransactionWithUserAndWallet();
		const seededTransactionTwo = await seedTransactionWithUserAndWallet();
		const seededTransactionIdThree = "non-existing-transaction-id";

		const transactions = await transactionRepository.findTransactionsByIds([
			seededTransactionOne.id,
			seededTransactionTwo.id,
			seededTransactionIdThree,
		]);

		expect(transactions).toHaveLength(2);
		assertTransaction(transactions[0], seededTransactionOne);
		assertTransaction(transactions[1], seededTransactionTwo);
		expect(transactions[2]).toBeUndefined();
	});

	it("should return empty array when given non-existing transaction id", async () => {
		const transactions = await transactionRepository.findTransactionsByIds(["non-existing-transaction-id"]);

		expect(transactions).toEqual([]);
	});
});
