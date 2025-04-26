import { describe, expect, it } from "bun:test";
import { CreateTransactionService } from "@/modules/transaction/src/domain/services/createTransactionService";
import {
	TRANSACTION_STATUS,
	TRANSACTION_TYPE,
} from "@/modules/transaction/src/domain/shared/constant";
import { TransactionRepository } from "@/modules/transaction/src/repositories/transactionRepository";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
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

	it("should throw when creating DEPOSIT and sender is not CASH_TOP_UP", async () => {
		const normalUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const receiver = await seedUser();
		let errorMessage = "";
		try {
			await service.createTransaction({
				senderId: normalUser.id,
				receiverId: receiver.id,
				amount: 50,
				type: TRANSACTION_TYPE.DEPOSIT,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}
		expect(errorMessage).toBe("DEPOSIT transactions require a sender with CASH_TOP_UP account type");
	});

	it("should create DEPOSIT when sender is CASH_TOP_UP", async () => {
		const topUpUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const receiver = await seedUser();
		const transaction = await service.createTransaction({
			senderId: topUpUser.id,
			receiverId: receiver.id,
			amount: 75,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		const persisted = await transactionRepository.findTransactionById(transaction.idValue);
		expect(persisted).not.toBeNull();
		expect(persisted!.typeValue).toBe(TRANSACTION_TYPE.DEPOSIT);
	});

	it("should throw when creating WITHDRAW and receiver is not CASH_TOP_UP", async () => {
		const sender = await seedUser();
		const normalUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		let errorMessage = "";
		try {
			await service.createTransaction({
				senderId: sender.id,
				receiverId: normalUser.id,
				amount: 60,
				type: TRANSACTION_TYPE.WITHDRAW,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}
		expect(errorMessage).toBe("WITHDRAW transactions require a receiver with CASH_TOP_UP account type");
	});

	it("should create WITHDRAW when receiver is CASH_TOP_UP", async () => {
		const sender = await seedUser();
		const topUpUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const transaction = await service.createTransaction({
			senderId: sender.id,
			receiverId: topUpUser.id,
			amount: 80,
			type: TRANSACTION_TYPE.WITHDRAW,
		});
		const persisted = await transactionRepository.findTransactionById(transaction.idValue);
		expect(persisted).not.toBeNull();
		expect(persisted!.typeValue).toBe(TRANSACTION_TYPE.WITHDRAW);
	});

	it("should throw when creating PAYMENT and receiver is not CASHIER", async () => {
		const sender = await seedUser();
		const normalUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		let errorMessage = "";
		try {
			await service.createTransaction({
				senderId: sender.id,
				receiverId: normalUser.id,
				amount: 100,
				type: TRANSACTION_TYPE.PAYMENT,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}
		expect(errorMessage).toBe("PAYMENT transactions require a receiver with CASHIER account type");
	});

	it("should create PAYMENT when receiver is CASHIER", async () => {
		const sender = await seedUser();
		const cashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const transaction = await service.createTransaction({
			senderId: sender.id,
			receiverId: cashier.id,
			amount: 120,
			type: TRANSACTION_TYPE.PAYMENT,
		});
		const persisted = await transactionRepository.findTransactionById(transaction.idValue);
		expect(persisted).not.toBeNull();
		expect(persisted!.typeValue).toBe(TRANSACTION_TYPE.PAYMENT);
	});
});
