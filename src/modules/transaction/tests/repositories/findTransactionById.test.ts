import { beforeAll, describe, expect, it } from "bun:test";
import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import type { ITransactionRawObject } from "@/modules/transaction/src/domain/shared/constant";
import {
	type ITransactionRepository,
	TransactionRepository,
} from "@/modules/transaction/src/repositories/transactionRepository";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

const assertTransaction = (value: ITransaction | null, expectedValue: ITransactionRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.senderIdValue).toBe(expectedValue.senderId);
	expect(value!.receiverIdValue).toBe(expectedValue.receiverId);
	expect(value!.amount).toBe(expectedValue.amount.toNumber());
	expect(value!.typeValue).toBe(expectedValue.type);
	expect(value!.statusValue).toBe(expectedValue.status);
};

describe("Test Transaction Repository findTransactionById", () => {
	let transactionRepository: ITransactionRepository;

	beforeAll(async () => {
		transactionRepository = new TransactionRepository();
	});

	it("should retrieve existing wallet found by Id", async () => {
		const seededSender = await seedUser();
		const seededReceiver = await seedUser();

		const seededTransaction = await seedTransaction({
			senderId: seededSender.id,
			receiverId: seededReceiver.id,
		});

		const transaction = await transactionRepository.findTransactionById(seededTransaction.id);

		assertTransaction(transaction, seededTransaction);
	});

	it("should hydrate sender and receiver in the transaction", async () => {
		const seededSender = await seedUser();
		const seededReceiver = await seedUser();

		const seededTransaction = await seedTransaction({
			senderId: seededSender.id,
			receiverId: seededReceiver.id,
		});

		const transaction = await transactionRepository.findTransactionById(seededTransaction.id, {
			sender: true,
			receiver: true,
		});

		assertTransaction(transaction, seededTransaction);
		expect(transaction!.sender!.idValue).toBe(seededSender.id);
		expect(transaction!.receiver!.idValue).toBe(seededReceiver.id);
	});

	it("should return null when given non-existing transaction id", async () => {
		const transaction = await transactionRepository.findTransactionById("not-a-transaction-id");

		expect(transaction).toBeNull();
	});
});
