import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { GetRecentTransactionsByUserIdUseCase } from "@/modules/transaction/src/useCase/getRecentTransactionsByUserIdUseCase";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("GetRecentTransactionByUserIdUseCase", () => {
	let getRecentTransactionsByUserIdUseCase: GetRecentTransactionsByUserIdUseCase;

	beforeAll(() => {
		getRecentTransactionsByUserIdUseCase = new GetRecentTransactionsByUserIdUseCase();
	});

	beforeEach(async () => {
		await db.userTransaction.deleteMany();
	});

	it("should return user transactions, limited by pagination size", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();

		const seededTransactionOne = await seedTransaction({
			senderId: seededUserOne.id,
			receiverId: seededUserTwo.id,
			type: TRANSACTION_TYPE.TRANSFER,
		});
		const seededTransactionTwo = await seedTransaction({
			senderId: seededUserTwo.id,
			receiverId: seededUserOne.id,
			type: TRANSACTION_TYPE.PAYMENT,
		});
		const seededTransactionThree = await seedTransaction({
			senderId: seededUserOne.id,
			receiverId: seededUserTwo.id,
			type: TRANSACTION_TYPE.WITHDRAW,
		});

		const result = await getRecentTransactionsByUserIdUseCase.execute({
			userId: seededUserOne.id,
			perPage: 2,
			page: 1,
		});

		expect(result.transactions).toHaveLength(2);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(true);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(2);

		const transactionIds = result.transactions.map((transaction) => transaction.idValue);
		expect(transactionIds).toEqual([seededTransactionOne.id, seededTransactionTwo.id]);
		expect(transactionIds).not.toContain(seededTransactionThree.id);
	});

	it("should return an empty list and pagination information when no transaction are seeded", async () => {
		const seededUser = await seedUser();

		const result = await getRecentTransactionsByUserIdUseCase.execute({
			userId: seededUser.id,
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
