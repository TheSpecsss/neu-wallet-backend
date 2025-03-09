import { beforeAll, describe, expect, it } from "bun:test";
import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import {
	AuditLogRepository,
	type IAuditLogRepository,
} from "@/modules/auditLog/src/repositories/auditLogRepository";
import { createAuditLogDomainObject } from "@/modules/auditLog/tests/utils/createAuditLogDomainObject";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

const assertAuditLog = (value: IAuditLog, expectedValue: IAuditLog) => {
	expect(value!.idValue).toBe(expectedValue.idValue);
	expect(value!.executorIdValue).toBe(expectedValue.executorIdValue);
	expect(value!.targetIdValue).toBe(expectedValue.targetIdValue);
	expect(value!.actionTypeValue).toBe(expectedValue.actionTypeValue);
	expect(value!.changes).toEqual(expectedValue.changes);
};

describe("Test AuditLog Repository save", () => {
	let auditLogRepository: IAuditLogRepository;

	beforeAll(async () => {
		auditLogRepository = new AuditLogRepository();
	});

	it("should save audit log", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser();

		const auditLogDomainObject = createAuditLogDomainObject({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});

		const savedAuditLog = await auditLogRepository.save(auditLogDomainObject);

		assertAuditLog(savedAuditLog, auditLogDomainObject);
	});
});
