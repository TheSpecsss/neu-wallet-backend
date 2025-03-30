import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import {
	AuditLogRepository,
	type IAuditLogRepository,
} from "@/modules/auditLog/src/repositories/auditLogRepository";
import { seedAuditLog } from "@/modules/auditLog/tests/utils/seedAuditLog";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("AuditLogRepository getAuditLogsByPagination", () => {
	let auditLogRepository: IAuditLogRepository;

	beforeAll(() => {
		auditLogRepository = new AuditLogRepository();
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

		const result = await auditLogRepository.getAuditLogsByPagination({ start: 0, size: 2 });

		expect(result).toHaveLength(2);

		const auditLogIds = result.map((auditLog) => auditLog.idValue);
		expect(auditLogIds).toEqual([seededAuditLogThree.id, seededAuditLogTwo.id]);
		expect(auditLogIds).not.toContain(seededAuditLogOne.id);
	});

	it("should return an empty list and pagination information when there's no user", async () => {
		const result = await auditLogRepository.getAuditLogsByPagination({
			start: 0,
			size: 10,
		});

		expect(result).toEqual([]);
	});
});
