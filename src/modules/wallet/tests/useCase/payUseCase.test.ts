import { beforeAll, describe, expect, it } from "bun:test";
import { TRANSACTION_STATUS } from "@/modules/transaction/src/domain/shared/constant";
import { TransactionRepository } from "@/modules/transaction/src/repositories/transactionRepository";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { MINIMUM_PAY_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import { PayUseCase } from "@/modules/wallet/src/useCase/payUseCase";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { Decimal } from "@/shared/domain/decimal";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

describe("PayUseCase", () => {
	let useCase: PayUseCase;
	let transactionRepository: TransactionRepository;

	beforeAll(async () => {
		useCase = new PayUseCase();
		transactionRepository = new TransactionRepository();
	});

	it("should remove users wallet balance by the amount", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededSenderWallet = await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		const wallet = await useCase.execute({
			senderId: seededSender.id,
			cashierId: seededCashier.id,
			amount: 500,
		});
		expect(wallet.idValue).toBe(seededSenderWallet.id);
		expect(wallet.balanceValue).toBe(0);

		const [successTransaction] = await transactionRepository.getTransactionsByPagination(
			seededSender.id,
			{ start: 0, size: 1 },
		);
		expect(successTransaction.senderIdValue).toBe(seededSender.id);
		expect(successTransaction.receiverIdValue).toBe(seededCashier.id);
		expect(successTransaction.statusValue).toBe(TRANSACTION_STATUS.SUCCESS);
	});

	it("should throw an error when amount is less than minimum pay amount", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId: seededCashier.id,
				amount: MINIMUM_PAY_AMOUNT - 1,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`The amount to be sent must be at least ${MINIMUM_PAY_AMOUNT}`);
	});

	it("should throw an error when sender are sending to itself", async () => {
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId: seededSender.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("You cannot send to yourself");
	});

	it("should throw an error when sender does not exist", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const senderId = new SnowflakeID().toString();

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId,
				cashierId: seededCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${senderId} does not exist`);
	});

	it("should throw an error when cashierId does not exist", async () => {
		const cashierId = new SnowflakeID().toString();
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${cashierId} does not exist`);
	});

	it("should throw an error when the cashier does not have permission", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId: seededCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededCashier.id} does not have the required permission`);
	});

	it("should throw an error when sender does not have enough balance", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(100),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				cashierId: seededCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededSender.id} does not have sufficient balance`);

		const [failedTransaction] = await transactionRepository.getTransactionsByPagination(
			seededSender.id,
			{ start: 0, size: 1 },
		);
		expect(failedTransaction.senderIdValue).toBe(seededSender.id);
		expect(failedTransaction.receiverIdValue).toBe(seededCashier.id);
		expect(failedTransaction.statusValue).toBe(TRANSACTION_STATUS.FAILED);
	});
});
