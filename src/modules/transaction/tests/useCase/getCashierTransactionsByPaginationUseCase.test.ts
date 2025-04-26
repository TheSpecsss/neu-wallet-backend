import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { GetCashierTransactionsByPaginationUseCase } from "@/modules/transaction/src/useCase/getCashierTransactionsByPaginationUseCase";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("GetCashierTransactionsByPaginationUseCase", () => {
	let useCase: GetCashierTransactionsByPaginationUseCase;

	beforeAll(() => {
		useCase = new GetCashierTransactionsByPaginationUseCase();
	});

	beforeEach(async () => {
		await db.userTransaction.deleteMany();
	});

	it("should return transactions involving cashiers, limited by pagination size", async () => {
		const seededCashier = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const seededUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const anotherUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		const seededTransactionOne = await seedTransaction({
			senderId: seededUser.id,
			receiverId: seededCashier.id,
			type: TRANSACTION_TYPE.PAYMENT,
		});
		const seededTransactionTwo = await seedTransaction({
			senderId: seededCashier.id,
			receiverId: seededUser.id,
			type: TRANSACTION_TYPE.TRANSFER,
		});
		const seededTransactionThree = await seedTransaction({
			senderId: seededUser.id,
			receiverId: anotherUser.id,
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
		expect(transactionIds).toContain(seededTransactionOne.id);
		expect(transactionIds).toContain(seededTransactionTwo.id);
		expect(transactionIds).not.toContain(seededTransactionThree.id);
	});

	it("should properly handle pagination when there are multiple cashiers", async () => {
		const cashierOne = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const cashierTwo = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
		const regularUser = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		const transactionOne = await seedTransaction({
			senderId: regularUser.id,
			receiverId: cashierOne.id,
			type: TRANSACTION_TYPE.PAYMENT,
		});
		const transactionTwo = await seedTransaction({
			senderId: regularUser.id,
			receiverId: cashierOne.id,
			type: TRANSACTION_TYPE.PAYMENT,
		});
		const transactionThree = await seedTransaction({
			senderId: regularUser.id,
			receiverId: cashierOne.id,
			type: TRANSACTION_TYPE.PAYMENT,
		});
		const transactionFour = await seedTransaction({
			senderId: cashierTwo.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.TRANSFER,
		});
		const transactionFive = await seedTransaction({
			senderId: cashierTwo.id,
			receiverId: regularUser.id,
			type: TRANSACTION_TYPE.TRANSFER,
		});

		const resultPage1 = await useCase.execute({
			perPage: 3,
			page: 1,
		});

		expect(resultPage1.transactions).toHaveLength(3);
		expect(resultPage1.page).toBe(1);
		expect(resultPage1.hasNextPage).toBe(true);
		expect(resultPage1.hasPreviousPage).toBe(false);
		expect(resultPage1.totalPages).toBe(2);

		const resultPage2 = await useCase.execute({
			perPage: 3,
			page: 2,
		});

		expect(resultPage2.transactions).toHaveLength(2);
		expect(resultPage2.page).toBe(2);
		expect(resultPage2.hasNextPage).toBe(false);
		expect(resultPage2.hasPreviousPage).toBe(true);
		expect(resultPage2.totalPages).toBe(2);

		const allTransactionIds = [
			...resultPage1.transactions.map((t) => t.idValue),
			...resultPage2.transactions.map((t) => t.idValue),
		];
		expect(allTransactionIds).toHaveLength(5);

		expect(allTransactionIds).toContain(transactionOne.id);
		expect(allTransactionIds).toContain(transactionTwo.id);
		expect(allTransactionIds).toContain(transactionThree.id);
		expect(allTransactionIds).toContain(transactionFour.id);
		expect(allTransactionIds).toContain(transactionFive.id);
	});

	it("should return an empty list and pagination information when no cashier transactions exist", async () => {
		const userOne = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const userTwo = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		await seedTransaction({
			senderId: userOne.id,
			receiverId: userTwo.id,
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
