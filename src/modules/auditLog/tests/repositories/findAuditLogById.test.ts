import { beforeAll, describe, expect, it } from "bun:test";
import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import type { IAuditLogChange } from "@/modules/auditLog/src/domain/shared/auditLogChanges";
import type { IAuditLogRawObject } from "@/modules/auditLog/src/domain/shared/constant";
import {
	AuditLogRepository,
	type IAuditLogRepository,
} from "@/modules/auditLog/src/repositories/auditLogRepository";
import { seedAuditLog } from "@/modules/auditLog/tests/utils/seedAuditLog";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

const assertAuditLog = (value: IAuditLog | null, expectedValue: IAuditLogRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.executorIdValue).toBe(expectedValue.executorId);
	expect(value!.targetIdValue).toBe(expectedValue.targetId);
	expect(value!.actionTypeValue).toBe(expectedValue.actionType);
	expect(value!.changes).toEqual(expectedValue.changes as unknown as IAuditLogChange[]);
};

describe("Test AuditLog Repository findAuditLogById", () => {
	let auditLogRepository: IAuditLogRepository;

	beforeAll(async () => {
		auditLogRepository = new AuditLogRepository();
	});

	it("should return audit log by id", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser();

		const seededAuditLog = await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});

		const auditLog = await auditLogRepository.findAuditLogById(seededAuditLog.id);

		assertAuditLog(auditLog, seededAuditLog);
	});

	it("should hydrate executor and target in the audit log", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser();

		const seededAuditLog = await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});

		const auditLog = await auditLogRepository.findAuditLogById(seededAuditLog.id, {
			executor: true,
			target: true,
		});

		assertAuditLog(auditLog, seededAuditLog);
		expect(auditLog!.executor!.idValue).toBe(executorUser.id);
		expect(auditLog!.target!.idValue).toBe(targetUser.id);
	});

	it("should return null when given non-existing audit log id", async () => {
		const auditLog = await auditLogRepository.findAuditLogById("not-a-audit-log-id");

		expect(auditLog).toBeNull();
	});
});
