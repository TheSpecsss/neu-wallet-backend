import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { GetCashierTopUpTransactionsByPaginationUseCase } from "@/modules/transaction/src/useCase/getCashierTopUpTransactionsByPaginationUseCase";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("GetCashierTopUpTransactionsByPaginationUseCase", () => {
	let useCase: GetCashierTopUpTransactionsByPaginationUseCase;

	beforeAll(() => {
		useCase = new GetCashierTopUpTransactionsByPaginationUseCase();
	});

	beforeEach(async () => {
		await db.userTransaction.deleteMany();
	});

	it("should return only DEPOSIT transactions involving CASH_TOP_UP users, limited by pagination size", async () => {
		const cashTopUpUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const cashierUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const regularUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const anotherUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		const depositTransaction = await seedTransaction({
			senderId: cashTopUpUser.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});

		const withdrawTransaction = await seedTransaction({
			senderId: regularUser.id,
			receiverId: cashTopUpUser.id,
			type: TRANSACTION_TYPE.WITHDRAW,
		});

		const paymentTransaction = await seedTransaction({
			senderId: cashierUser.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.PAYMENT,
		});

		const transferTransaction = await seedTransaction({
			senderId: anotherUser.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.TRANSFER,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
		});

		expect(result.transactions).toHaveLength(2);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(1);

		const transactionIds = result.transactions.map((transaction) => transaction.idValue);
		expect(transactionIds).toContain(depositTransaction.id);
		expect(transactionIds).toContain(withdrawTransaction.id);
		expect(transactionIds).not.toContain(paymentTransaction.id);
		expect(transactionIds).not.toContain(transferTransaction.id);
	});

	it("should properly handle pagination for multiple transactions involving CASH_TOP_UP users", async () => {
		const cashTopUpUser1 = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const cashTopUpUser2 = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const regularUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		const deposit1 = await seedTransaction({
			senderId: cashTopUpUser1.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		const deposit2 = await seedTransaction({
			senderId: cashTopUpUser2.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		const deposit3 = await seedTransaction({
			senderId: cashTopUpUser1.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});

		const withdraw1 = await seedTransaction({
			senderId: regularUser.id,
			receiverId: cashTopUpUser1.id,
			type: TRANSACTION_TYPE.WITHDRAW,
		});
		const withdraw2 = await seedTransaction({
			senderId: regularUser.id,
			receiverId: cashTopUpUser2.id,
			type: TRANSACTION_TYPE.WITHDRAW,
		});

		const nonMatch = await seedTransaction({
			senderId: regularUser.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.TRANSFER,
		});

		const resultPage1 = await useCase.execute({ perPage: 3, page: 1 });
		expect(resultPage1.transactions).toHaveLength(3);
		expect(resultPage1.page).toBe(1);
		expect(resultPage1.hasNextPage).toBe(true);
		expect(resultPage1.hasPreviousPage).toBe(false);
		expect(resultPage1.totalPages).toBe(2);

		const resultPage2 = await useCase.execute({ perPage: 3, page: 2 });
		expect(resultPage2.transactions).toHaveLength(2);
		expect(resultPage2.page).toBe(2);
		expect(resultPage2.hasNextPage).toBe(false);
		expect(resultPage2.hasPreviousPage).toBe(true);
		expect(resultPage2.totalPages).toBe(2);

		const allIds = [
			...resultPage1.transactions.map((t) => t.idValue),
			...resultPage2.transactions.map((t) => t.idValue),
		];
		expect(allIds).toHaveLength(5);
		expect(allIds).toContain(deposit1.id);
		expect(allIds).toContain(deposit2.id);
		expect(allIds).toContain(deposit3.id);
		expect(allIds).toContain(withdraw1.id);
		expect(allIds).toContain(withdraw2.id);
		expect(allIds).not.toContain(nonMatch.id);
	});

	it("should return an empty list when no DEPOSIT transactions with CASH_TOP_UP users exist", async () => {
		const regularCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const regularUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		await seedTransaction({
			senderId: regularCashier.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.TRANSFER,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
		});

		expect(result.transactions).toEqual([]);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.page).toBe(1);
		expect(result.totalPages).toBe(0);
	});
});
