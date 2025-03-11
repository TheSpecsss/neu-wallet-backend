import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { FindUsersByPaginationUseCase } from "@/modules/user/src/useCase/findUsersByPaginationUseCase";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("FindUsersByPaginationUseCase", () => {
	let useCase: FindUsersByPaginationUseCase;

	beforeAll(() => {
		useCase = new FindUsersByPaginationUseCase();
	});

	beforeEach(async () => {
		await db.userAuditLog.deleteMany();
		await db.userTransaction.deleteMany();
		await db.userVerification.deleteMany();
		await db.user.deleteMany();
	});

	it("should return users, limited by pagination size", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserThree = await seedUser();

		const seededExecutor = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		const result = await useCase.execute({
			perPage: 2,
			page: 1,
			userId: seededExecutor.id,
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

	it("should thrown an error when executor does not have admin permission", async () => {
		const seededExecutor = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		await seedUser();
		await seedUser();
		await seedUser();

		let errorMessage = "";
		try {
			await useCase.execute({
				perPage: 2,
				page: 1,
				userId: seededExecutor.id,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededExecutor.id} does not have admin permission`);
	});
});
