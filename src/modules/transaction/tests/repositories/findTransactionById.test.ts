import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import type { ITransactionRawObject } from "@/modules/transaction/src/domain/shared/constant";
import {
	type ITransactionRepository,
	TransactionRepository,
} from "@/modules/transaction/src/repositories/transactionRepository";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { db } from "@/shared/infrastructure/database";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";

const assertTransaction = (value: ITransaction | null, expectedValue: ITransactionRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.senderIdValue).toBe(expectedValue.senderId);
	expect(value!.receiverIdValue).toBe(expectedValue.receiverId);
	expect(value!.amountValue).toBe(expectedValue.amount.toNumber());
	expect(value!.typeValue).toBe(expectedValue.type);
};

describe("Test Transaction Repository findTransactionById", () => {
	let transactionRepository: ITransactionRepository;

	beforeAll(async () => {
		transactionRepository = new TransactionRepository();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it("should retrieve existing wallet found by Id", async () => {
		const seededSenderWallet = await seedWallet();
		const seededReceiverWallet = await seedWallet();

		const seededSender = await seedUser({ walletId: seededSenderWallet.id });
		const seededReceiver = await seedUser({ walletId: seededReceiverWallet.id });

		const seededTransaction = await seedTransaction({ senderId: seededSender.id, receiverId: seededReceiver.id });

		const transaction = await transactionRepository.findTransactionById(seededTransaction.id);

		assertTransaction(transaction, seededTransaction);
	});

	it("should hydrate sender and receiver in the transaction", async () => {
		const seededSenderWallet = await seedWallet();
		const seededReceiverWallet = await seedWallet();

		const seededSender = await seedUser({ walletId: seededSenderWallet.id });
		const seededReceiver = await seedUser({ walletId: seededReceiverWallet.id });

		const seededTransaction = await seedTransaction({ senderId: seededSender.id, receiverId: seededReceiver.id });

		const transaction = await transactionRepository.findTransactionById(
			seededTransaction.id,
			{ sender: true, receiver: true },
		);

		assertTransaction(transaction, seededTransaction);
		expect(transaction!.sender!.idValue).toBe(seededSender.id);
		expect(transaction!.receiver!.idValue).toBe(seededReceiver.id);
	});

	it("should return null when given non-existing wallet id", async () => {
		const transaction = await transactionRepository.findTransactionById("not-a-transaction-id");

		expect(transaction).toBeNull();
	});
});
