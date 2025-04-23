import { describe, expect, it } from "bun:test";
import { CreateTransactionService } from "@/modules/transaction/src/domain/services/createTransactionService";
import {
	TRANSACTION_STATUS,
	TRANSACTION_TYPE,
} from "@/modules/transaction/src/domain/shared/constant";
import { TransactionRepository } from "@/modules/transaction/src/repositories/transactionRepository";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

describe("CreateTransactionService", () => {
	const service = new CreateTransactionService();
	const transactionRepository = new TransactionRepository();

	it("should create a transaction with PROCESSING status", async () => {
		const seededSender = await seedUser();
		const seededReceiver = await seedUser();

		const transaction = await service.createTransaction({
			senderId: seededSender.id,
			receiverId: seededReceiver.id,
			amount: 100,
			type: TRANSACTION_TYPE.TRANSFER,
		});
		expect(transaction.statusValue).toBe(TRANSACTION_STATUS.PROCESSING);

		const persisted = await transactionRepository.findTransactionById(transaction.idValue);
		expect(persisted).not.toBeNull();
		expect(persisted!.statusValue).toBe(TRANSACTION_STATUS.PROCESSING);
	});

	it("should mark transaction SUCCESS on successful executeTransaction", async () => {
		const seededSender = await seedUser();
		const seededReceiver = await seedUser();

		let transactionId = "";
		await service.executeTransaction(
			{
				senderId: seededSender.id,
				receiverId: seededReceiver.id,
				amount: 150,
				type: TRANSACTION_TYPE.TRANSFER,
			},
			async (transaction) => {
				expect(transaction.statusValue).toBe(TRANSACTION_STATUS.PROCESSING);

				transactionId = transaction.idValue;
			},
		);

		const persisted = await transactionRepository.findTransactionById(transactionId!);
		expect(persisted).not.toBeNull();
		expect(persisted!.statusValue).toBe(TRANSACTION_STATUS.SUCCESS);
	});

	it("should mark transaction FAILED on callback error", async () => {
		const seededSender = await seedUser();
		const seededReceiver = await seedUser();

		let transactionId = "";
		let errorMessage = "";
		try {
			await service.executeTransaction(
				{
					senderId: seededSender.id,
					receiverId: seededReceiver.id,
					amount: 200,
					type: TRANSACTION_TYPE.TRANSFER,
				},
				async (transaction) => {
          expect(transaction.statusValue).toBe(TRANSACTION_STATUS.PROCESSING);

					transactionId = transaction.idValue;
					throw new Error("Error Message");
				},
			);
		} catch (error) {
			errorMessage = (error as Error).message;
		}
		expect(errorMessage).toBe("Error Message");

		const persisted = await transactionRepository.findTransactionById(transactionId);
		expect(persisted).not.toBeNull();
		expect(persisted!.statusValue).toBe(TRANSACTION_STATUS.FAILED);
	});
});
