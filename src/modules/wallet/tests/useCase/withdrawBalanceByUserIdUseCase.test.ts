import { beforeAll, describe, expect, it } from "bun:test";
import { TRANSACTION_STATUS } from "@/modules/transaction/src/domain/shared/constant";
import { TransactionRepository } from "@/modules/transaction/src/repositories/transactionRepository";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { MINIMUM_WITHDRAW_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import { WithdrawBalanceByUserIdUseCase } from "@/modules/wallet/src/useCase/withdrawBalanceByUserIdUseCase";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { Decimal } from "@/shared/domain/decimal";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

describe("WithdrawBalanceByUserIdUseCase", () => {
	let useCase: WithdrawBalanceByUserIdUseCase;
	let transactionRepository: TransactionRepository;

	beforeAll(async () => {
		useCase = new WithdrawBalanceByUserIdUseCase();
		transactionRepository = new TransactionRepository();
	});

	it("should allow user to be able to withdraw", async () => {
		const seededTopUpCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededSenderWallet = await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		const wallet = await useCase.execute({
			senderId: seededSender.id,
			topUpCashierId: seededTopUpCashier.id,
			amount: 500,
		});
		expect(wallet.idValue).toBe(seededSenderWallet.id);
		expect(wallet.balanceValue).toBe(0);

		const [successTransaction] = await transactionRepository.getTransactionsByPagination(
			seededSender.id,
			{ start: 0, size: 1 },
		);
		expect(successTransaction.senderIdValue).toBe(seededSender.id);
		expect(successTransaction.receiverIdValue).toBe(seededTopUpCashier.id);
		expect(successTransaction.statusValue).toBe(TRANSACTION_STATUS.SUCCESS);
	});

	it("should throw an error when amount is less than minimum withdraw amount", async () => {
		const seededTopUpCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				topUpCashierId: seededTopUpCashier.id,
				amount: MINIMUM_WITHDRAW_AMOUNT - 1,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			`The amount to be withdrawn must be at least ${MINIMUM_WITHDRAW_AMOUNT}`,
		);
	});

	it("should throw an error when sender are sending to itself", async () => {
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				topUpCashierId: seededSender.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("You cannot send to yourself");
	});

	it("should throw an error when sender does not exist", async () => {
		const seededTopUpCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const senderId = new SnowflakeID().toString();

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId,
				topUpCashierId: seededTopUpCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${senderId} does not exist`);
	});

	it("should throw an error when receiverId does not exist", async () => {
		const topUpCashierId = new SnowflakeID().toString();
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				topUpCashierId,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${topUpCashierId} does not exist`);
	});

	it("should throw an error when the receiver does not have CASHIER_TOP_UP permission", async () => {
		const seededTopUpCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(500),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				topUpCashierId: seededTopUpCashier.id,
				amount: 200,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			`User ${seededTopUpCashier.id} does not have the required permission`,
		);
	});

	it("should throw an error when sender does not have enough balance", async () => {
		const seededTopUpCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const seededSender = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		await seedWallet({
			userId: seededSender.id,
			balance: new Decimal(100),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				senderId: seededSender.id,
				topUpCashierId: seededTopUpCashier.id,
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
		expect(failedTransaction.receiverIdValue).toBe(seededTopUpCashier.id);
		expect(failedTransaction.statusValue).toBe(TRANSACTION_STATUS.FAILED);
	});
});
