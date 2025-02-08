import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { FindUsersWithPaginationUseCase } from "@/modules/user/src/useCase/findUsersWithPaginationUseCase";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { db } from "@/shared/infrastructure/database";

describe("FindUsersWithPaginationUseCase", () => {
	let findUsersWithPaginationUseCase: FindUsersWithPaginationUseCase;

	beforeAll(() => {
		findUsersWithPaginationUseCase = new FindUsersWithPaginationUseCase();
	});

	beforeEach(async () => {
		await db.user.deleteMany();
	});

	it("should return users, limited by pagination size", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();
		const seededWalletThree = await seedWallet();

		const seededUserOne = await seedUser({ walletId: seededWalletOne.id });
		const seededUserTwo = await seedUser({ walletId: seededWalletTwo.id });
		const seededUserThree = await seedUser({ walletId: seededWalletThree.id });

		const result = await findUsersWithPaginationUseCase.execute({
			perPage: 2,
			page: 1,
		});

		expect(result.users).toHaveLength(2);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(true);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(2);

		const userIds = result.users.map((user) => user.idValue);
		expect(userIds).toEqual([seededUserOne.id, seededUserTwo.id]);
		expect(userIds).not.toContain(seededUserThree.id);
	});

	it("should return with delete users since includeDeleted is true, limited by pagination size", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();
		const seededWalletThree = await seedWallet();

		const seededUserOne = await seedUser({ walletId: seededWalletOne.id });
		const seededUserTwo = await seedUser({
			walletId: seededWalletTwo.id,
			isDeleted: true,
			deletedAt: new Date(),
		});
		const seededUserThree = await seedUser({ walletId: seededWalletThree.id });

		const result = await findUsersWithPaginationUseCase.execute({
			perPage: 2,
			page: 1,
			options: { includeDeleted: true },
		});

		const userIds = result.users.map((user) => user.idValue);
		expect(userIds).toEqual([seededUserOne.id, seededUserTwo.id]);
		expect(userIds).not.toContain(seededUserThree.id);
	});

	it("should not return deleted users, limited by pagination size", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();
		const seededWalletThree = await seedWallet();

		const seededUserOne = await seedUser({ walletId: seededWalletOne.id });
		const seededUserTwo = await seedUser({
			walletId: seededWalletTwo.id,
			isDeleted: true,
			deletedAt: new Date(),
		});
		const seededUserThree = await seedUser({ walletId: seededWalletThree.id });

		const result = await findUsersWithPaginationUseCase.execute({
			perPage: 2,
			page: 1,
		});

		const userIds = result.users.map((user) => user.idValue);
		expect(userIds).toEqual([seededUserOne.id, seededUserThree.id]);
		expect(userIds).not.toContain(seededUserTwo.id);
	});

	it("should return an empty list and pagination information when no users are seeded", async () => {
		const result = await findUsersWithPaginationUseCase.execute({
			perPage: 10,
			page: 1,
		});

		expect(result.users).toEqual([]);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.page).toBe(1);
		expect(result.totalPages).toBe(0);
	});
});
