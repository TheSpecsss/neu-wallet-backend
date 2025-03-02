import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { FindUsersWithPaginationUseCase } from "@/modules/user/src/useCase/findUsersWithPaginationUseCase";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("FindUsersWithPaginationUseCase", () => {
	let findUsersWithPaginationUseCase: FindUsersWithPaginationUseCase;

	beforeAll(() => {
		findUsersWithPaginationUseCase = new FindUsersWithPaginationUseCase();
	});

	beforeEach(async () => {
		await db.userTransaction.deleteMany();
		await db.userVerification.deleteMany();
		await db.user.deleteMany();
	});

	it("should return users, limited by pagination size", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserThree = await seedUser();

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
