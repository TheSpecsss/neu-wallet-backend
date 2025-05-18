import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { GetTransactionsByFilterAndPaginationUseCase } from "@/modules/transaction/src/useCase/getTransactionsByFilterAndPaginationUseCase";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("GetTransactionsByFilterAndPaginationUseCase", () => {
	let useCase: GetTransactionsByFilterAndPaginationUseCase;

	beforeAll(() => {
		useCase = new GetTransactionsByFilterAndPaginationUseCase();
	});

	beforeEach(async () => {
		await db.userTransaction.deleteMany();
	});

	it("should return all transactions when user is admin and filter transactions by date range and type", async () => {
		const startDate = new Date(2025, 1, 1);
		const endDate = new Date(2025, 1, 2);
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		const inRangeDepositOne = await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.DEPOSIT,
			createdAt: startDate,
		});
		const inRangeDepositTwo = await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.DEPOSIT,
			createdAt: endDate,
		});
		await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.DEPOSIT,
			createdAt: new Date(2025, 1, 3),
		});
		await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.WITHDRAW,
			createdAt: startDate,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: {
				startDate,
				endDate,
				types: [TRANSACTION_TYPE.DEPOSIT],
			},
		});

		expect(result.transactions).toHaveLength(2);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(1);

		const transactionIds = result.transactions.map((t) => t.idValue);
		expect(transactionIds).toEqual([inRangeDepositOne.id, inRangeDepositTwo.id]);
	});

	it("should return all transactions when user is admin and filter transactions by user id", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		const userAlice = await seedUser();
		const userBob = await seedUser();
		const userCharlie = await seedUser();

		const transaction1 = await seedTransaction({
			senderId: userAlice.id,
			receiverId: userBob.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		const transaction2 = await seedTransaction({
			senderId: userBob.id,
			receiverId: userAlice.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		await seedTransaction({
			senderId: userCharlie.id,
			receiverId: userBob.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: { id: userAlice.id },
		});

		expect(result.transactions).toHaveLength(2);
		const ids = result.transactions.map((t) => t.idValue);
		expect(ids).toEqual([transaction1.id, transaction2.id]);
	});

	it("should return all transactions when user is admin and filter transactions by user name", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		const userAlice = await seedUser({ name: "Alice" });
		const userBob = await seedUser({ name: "Bob" });
		const userCharlie = await seedUser({ name: "Charlie" });

		const transaction1 = await seedTransaction({
			senderId: userAlice.id,
			receiverId: userBob.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		const transaction2 = await seedTransaction({
			senderId: userBob.id,
			receiverId: userAlice.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		await seedTransaction({
			senderId: userCharlie.id,
			receiverId: userBob.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: { name: "Alice" },
		});

		expect(result.transactions).toHaveLength(2);
		const ids = result.transactions.map((t) => t.idValue);
		expect(ids).toEqual([transaction1.id, transaction2.id]);
	});

	it("should return all transactions when user is admin and filter transactions by user email", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		const userAlice = await seedUser();
		const userBob = await seedUser();
		const userCharlie = await seedUser();

		const transaction1 = await seedTransaction({
			senderId: userAlice.id,
			receiverId: userBob.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		const transaction2 = await seedTransaction({
			senderId: userBob.id,
			receiverId: userAlice.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		await seedTransaction({
			senderId: userCharlie.id,
			receiverId: userBob.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: { email: userAlice.email },
		});

		expect(result.transactions).toHaveLength(2);
		const ids = result.transactions.map((t) => t.idValue);
		expect(ids).toEqual([transaction1.id, transaction2.id]);
	});

	it("should return all transactions when user is admin and filter transactions with multiple type", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		const user1 = await seedUser();
		const user2 = await seedUser();

		const depositTransaction = await seedTransaction({
			senderId: user1.id,
			receiverId: user2.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		const withdrawTransaction = await seedTransaction({
			senderId: user1.id,
			receiverId: user2.id,
			type: TRANSACTION_TYPE.WITHDRAW,
		});
		await seedTransaction({
			senderId: user1.id,
			receiverId: user2.id,
			type: TRANSACTION_TYPE.TRANSFER,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: {
				types: [TRANSACTION_TYPE.DEPOSIT, TRANSACTION_TYPE.WITHDRAW],
			},
		});

		expect(result.transactions).toHaveLength(2);
		const ids = result.transactions.map((t) => t.idValue);
		expect(ids).toEqual([depositTransaction.id, withdrawTransaction.id]);
	});

	it("should return all transactions when user is admin and filter transactions with multiple account type", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		const user1 = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP });
		const user2 = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const user3 = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });

		const depositTransaction = await seedTransaction({
			senderId: user1.id,
			receiverId: user2.id,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
		const withdrawTransaction = await seedTransaction({
			senderId: user1.id,
			receiverId: user2.id,
			type: TRANSACTION_TYPE.WITHDRAW,
		});
		await seedTransaction({
			senderId: user2.id,
			receiverId: user3.id,
			type: TRANSACTION_TYPE.PAYMENT,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: {
				accountTypes: [USER_ACCOUNT_TYPE.CASH_TOP_UP],
			},
		});

		expect(result.transactions).toHaveLength(2);
		const ids = result.transactions.map((t) => t.idValue);
		expect(ids).toEqual([depositTransaction.id, withdrawTransaction.id]);
	});

	it("should return empty list when no transactions match filters", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.TRANSFER,
			createdAt: new Date(2025, 0, 1),
		});

		const result = await useCase.execute({
			perPage: 5,
			page: 1,
			userId: userAdmin.id,
			filter: {
				startDate: new Date(2025, 0, 2),
				endDate: new Date(2025, 0, 3),
				types: [TRANSACTION_TYPE.DEPOSIT],
			},
		});

		expect(result.transactions).toEqual([]);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(0);
	});

	it("should return user transactions when user is not super admin and filter transactions by date range and type", async () => {
		const startDate = new Date(2025, 1, 1);
		const endDate = new Date(2025, 1, 2);
		const user = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		const inRangeDepositOne = await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: user.id,
			type: TRANSACTION_TYPE.DEPOSIT,
			createdAt: startDate,
		});
		await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.DEPOSIT,
			createdAt: endDate,
		});
		await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.DEPOSIT,
			createdAt: new Date(2025, 1, 3),
		});
		await seedTransaction({
			senderId: user.id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.WITHDRAW,
			createdAt: startDate,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: user.id,
			filter: {
				startDate,
				endDate,
				types: [TRANSACTION_TYPE.DEPOSIT],
			},
		});

		expect(result.transactions).toHaveLength(1);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(1);

		const transactionIds = result.transactions.map((t) => t.idValue);
		expect(transactionIds).toEqual([inRangeDepositOne.id]);
	});

	it("should return empty list when user does not have transactions but matches filters", async () => {
		const startDate = new Date(2025, 1, 1);
		const endDate = new Date(2025, 1, 2);
		const user = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.DEPOSIT,
			createdAt: startDate,
		});
		await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.DEPOSIT,
			createdAt: endDate,
		});
		await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.DEPOSIT,
			createdAt: new Date(2025, 1, 3),
		});
		await seedTransaction({
			senderId: (await seedUser()).id,
			receiverId: (await seedUser()).id,
			type: TRANSACTION_TYPE.WITHDRAW,
			createdAt: startDate,
		});

		const result = await useCase.execute({
			perPage: 5,
			page: 1,
			userId: user.id,
			filter: {
				startDate: new Date(2025, 0, 2),
				endDate: new Date(2025, 0, 3),
				types: [TRANSACTION_TYPE.DEPOSIT],
			},
		});

		expect(result.transactions).toEqual([]);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(0);
	});
});
