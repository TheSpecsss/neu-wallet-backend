import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { GetUsersByPaginationUseCase } from "@/modules/user/src/useCase/getUsersByPaginationUseCase";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("GetUsersByPaginationUseCase", () => {
	let useCase: GetUsersByPaginationUseCase;

	beforeAll(() => {
		useCase = new GetUsersByPaginationUseCase();
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

		const result = await useCase.execute({
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

	it("should throw an error when perPage is less than 1", async () => {
		await seedUser();
		await seedUser();
		await seedUser();

		let errorMessage = "";
		try {
			await useCase.execute({
				page: 1,
				perPage: -1,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("perPage must be greater than or equal to 1");
	});

	it("should throw an error when page is less than 1", async () => {
		await seedUser();
		await seedUser();
		await seedUser();

		let errorMessage = "";
		try {
			await useCase.execute({
				page: -1,
				perPage: 10,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("page must be greater than or equal to 1");
	});
});
