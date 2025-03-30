import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { GetAuditLogsByPaginationUseCase } from "@/modules/auditLog/src/useCase/getAuditLogsByPaginationUseCase";
import { seedAuditLog } from "@/modules/auditLog/tests/utils/seedAuditLog";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("GetAuditLogsByPaginationUseCase", () => {
	let useCase: GetAuditLogsByPaginationUseCase;

	beforeAll(() => {
		useCase = new GetAuditLogsByPaginationUseCase();
	});

	beforeEach(async () => {
		await db.userAuditLog.deleteMany();
	});

	it("should return audit logs, limited by pagination size", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser();

		const seededAuditLogOne = await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});
		const seededAuditLogTwo = await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});
		const seededAuditLogThree = await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});

		const result = await useCase.execute({ page: 1, perPage: 2 });

		expect(result.auditLogs).toHaveLength(2);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(true);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(2);

		const auditLogIds = result.auditLogs.map((auditLog) => auditLog.idValue);
		expect(auditLogIds).toEqual([seededAuditLogThree.id, seededAuditLogTwo.id]);
		expect(auditLogIds).not.toContain(seededAuditLogOne.id);
	});

	it("should return an empty list and pagination information when there's no user", async () => {
		const result = await useCase.execute({
			page: 1,
			perPage: 10,
		});

		expect(result.auditLogs).toHaveLength(0);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(0);
	});

	it("should throw an error when perPage is less than 1", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser();

		await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});
		await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});
		await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});

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
		const executorUser = await seedUser();
		const targetUser = await seedUser();

		await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});
		await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});
		await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});

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
