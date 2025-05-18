import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { ACTION_TYPE } from "@/modules/auditLog/src/domain/shared/constant";
import { GetAuditLogsByFilterAndPaginationUseCase } from "@/modules/auditLog/src/useCase/getAuditLogsByFilterAndPaginationUseCase";
import { seedAuditLog } from "@/modules/auditLog/tests/utils/seedAuditLog";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

describe("GetAuditLogsByFilterAndPaginationUseCase", () => {
	let useCase: GetAuditLogsByFilterAndPaginationUseCase;

	beforeAll(() => {
		useCase = new GetAuditLogsByFilterAndPaginationUseCase();
	});

	beforeEach(async () => {
		await db.userAuditLog.deleteMany();
	});

	it("should return all audit logs when user is admin and filter transactions by date range and type", async () => {
		const startDate = new Date(2025, 1, 1);
		const endDate = new Date(2025, 1, 2);
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		const inRangeActionTypeOne = await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.USER_UPDATE,
			createdAt: startDate,
		});
		const inRangeActionTypeTwo = await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.USER_UPDATE,
			createdAt: endDate,
		});
		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.WALLET_DELETE,
		});
		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.USER_DELETE,
			createdAt: startDate,
		});
		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.WALLET_DELETE,
			createdAt: endDate,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: {
				startDate,
				endDate,
				actionTypes: [ACTION_TYPE.USER_UPDATE],
			},
		});

		expect(result.auditLogs).toHaveLength(2);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(1);

		const auditLogIds = result.auditLogs.map((t) => t.idValue);
		expect(auditLogIds).toEqual([inRangeActionTypeOne.id, inRangeActionTypeTwo.id]);
	});

	it("should return all audit logs when user is admin and filter audit logs by user id", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		const userAlice = await seedUser({ name: "Alice" });
		const userBob = await seedUser({ name: "Bob" });
		const userCharlie = await seedUser({ name: "Charlie" });

		const inRangeActionTypeOne = await seedAuditLog({
			executorId: userAlice.id,
			targetId: userBob.id,
			actionType: ACTION_TYPE.USER_UPDATE,
		});
		const inRangeActionTypeTwo = await seedAuditLog({
			executorId: userBob.id,
			targetId: userAlice.id,
			actionType: ACTION_TYPE.USER_UPDATE,
		});
		await seedAuditLog({
			executorId: userCharlie.id,
			targetId: userBob.id,
			actionType: ACTION_TYPE.WALLET_DELETE,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: { id: userAlice.id },
		});

		expect(result.auditLogs).toHaveLength(2);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(1);

		const auditLogIds = result.auditLogs.map((t) => t.idValue);
		expect(auditLogIds).toEqual([inRangeActionTypeOne.id, inRangeActionTypeTwo.id]);
	});

	it("should return all audit logs when user is admin and filter audit logs by user name", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		const userAlice = await seedUser({ name: "Alice" });
		const userBob = await seedUser({ name: "Bob" });
		const userCharlie = await seedUser({ name: "Charlie" });

		const inRangeActionTypeOne = await seedAuditLog({
			executorId: userAlice.id,
			targetId: userBob.id,
			actionType: ACTION_TYPE.USER_UPDATE,
		});
		const inRangeActionTypeTwo = await seedAuditLog({
			executorId: userBob.id,
			targetId: userAlice.id,
			actionType: ACTION_TYPE.USER_UPDATE,
		});
		await seedAuditLog({
			executorId: userCharlie.id,
			targetId: userBob.id,
			actionType: ACTION_TYPE.WALLET_DELETE,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: { name: userAlice.name },
		});

		expect(result.auditLogs).toHaveLength(2);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(1);

		const auditLogIds = result.auditLogs.map((t) => t.idValue);
		expect(auditLogIds).toEqual([inRangeActionTypeOne.id, inRangeActionTypeTwo.id]);
	});

	it("should return all audit logs when user is admin and filter audit logs by user email", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		const userAlice = await seedUser();
		const userBob = await seedUser();
		const userCharlie = await seedUser();

		const inRangeAuditLogOne = await seedAuditLog({
			executorId: userAlice.id,
			targetId: userBob.id,
			actionType: ACTION_TYPE.USER_UPDATE,
		});
		const inRangeAuditLogTwo = await seedAuditLog({
			executorId: userBob.id,
			targetId: userAlice.id,
			actionType: ACTION_TYPE.USER_UPDATE,
		});
		await seedAuditLog({
			executorId: userCharlie.id,
			targetId: userBob.id,
			actionType: ACTION_TYPE.WALLET_DELETE,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: { email: userAlice.email },
		});

		expect(result.auditLogs).toHaveLength(2);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(1);

		const auditLogIds = result.auditLogs.map((t) => t.idValue);
		expect(auditLogIds).toEqual([inRangeAuditLogOne.id, inRangeAuditLogTwo.id]);
	});

	it("should return all audit logs when user is admin and filter audit logs with multiple action type", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		const inRangeActionTypeOne = await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.WALLET_UPDATE,
		});
		const inRangeActionTypeTwo = await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.USER_UPDATE,
		});
		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.WALLET_DELETE,
		});
		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.USER_DELETE,
		});
		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.WALLET_DELETE,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: userAdmin.id,
			filter: {
				actionTypes: [ACTION_TYPE.USER_UPDATE, ACTION_TYPE.WALLET_UPDATE],
			},
		});

		expect(result.auditLogs).toHaveLength(2);
		const ids = result.auditLogs.map((t) => t.idValue);
		expect(ids).toEqual([inRangeActionTypeOne.id, inRangeActionTypeTwo.id]);
	});

	it("should return empty list when no audit logs match filters", async () => {
		const userAdmin = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.WALLET_UPDATE,
			createdAt: new Date(2025, 0, 1),
		});

		const result = await useCase.execute({
			perPage: 5,
			page: 1,
			userId: userAdmin.id,
			filter: {
				startDate: new Date(2025, 0, 2),
				endDate: new Date(2025, 0, 3),
				actionTypes: [ACTION_TYPE.USER_UPDATE],
			},
		});

		expect(result.auditLogs).toEqual([]);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(0);
	});

	it("should return user audit logs when user is not super admin and filter audit logs by date range and type", async () => {
		const startDate = new Date(2025, 1, 1);
		const endDate = new Date(2025, 1, 2);
		const user = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });

		const inRangeAuditLogOne = await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: user.id,
			actionType: ACTION_TYPE.USER_UPDATE,
			createdAt: startDate,
		});
		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.USER_UPDATE,
			createdAt: endDate,
		});
		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.WALLET_DELETE,
		});
		await seedAuditLog({
			executorId: (await seedUser()).id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.USER_DELETE,
			createdAt: startDate,
		});
		await seedAuditLog({
			executorId: user.id,
			targetId: (await seedUser()).id,
			actionType: ACTION_TYPE.WALLET_DELETE,
			createdAt: endDate,
		});

		const result = await useCase.execute({
			perPage: 10,
			page: 1,
			userId: user.id,
			filter: {
				startDate,
				endDate,
				actionTypes: [ACTION_TYPE.USER_UPDATE],
			},
		});

		expect(result.auditLogs).toHaveLength(1);
		expect(result.page).toBe(1);
		expect(result.hasNextPage).toBe(false);
		expect(result.hasPreviousPage).toBe(false);
		expect(result.totalPages).toBe(1);

		const auditLogIds = result.auditLogs.map((t) => t.idValue);
		expect(auditLogIds).toEqual([inRangeAuditLogOne.id]);
	});
});
