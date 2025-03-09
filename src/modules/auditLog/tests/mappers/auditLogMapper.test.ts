import { describe, expect, it } from "bun:test";
import { AuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import type { IAuditLogChange } from "@/modules/auditLog/src/domain/shared/auditLogChanges";
import { AuditLogMapper } from "@/modules/auditLog/src/mappers/auditLogMapper";
import { createAuditLogDomainObject } from "@/modules/auditLog/tests/utils/createAuditLogDomainObject";
import { seedAuditLog } from "@/modules/auditLog/tests/utils/seedAuditLog";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import type { InputJsonValue } from "@prisma/client/runtime/client";

describe("AuditLogMapper", () => {
	it("should map to domain from persistence data", async () => {
		const executorUser = await seedUser();
		const targetUser = await seedUser();

		const schemaObject = await seedAuditLog({
			executorId: executorUser.id,
			targetId: targetUser.id,
		});
		const domainObject = AuditLogMapper.toDomain(schemaObject);

		expect(domainObject).toBeInstanceOf(AuditLog);
		expect(domainObject.idValue).toBe(schemaObject.id);
		expect(domainObject.executorIdValue).toBe(schemaObject.executorId);
		expect(domainObject.targetIdValue).toBe(schemaObject.targetId);
		expect(domainObject.actionTypeValue).toBe(schemaObject.actionType);
		expect(domainObject.changes).toEqual(schemaObject.changes as unknown as IAuditLogChange[]);
	});

	it("should map to persistence from domain", async () => {
		const domainObject = createAuditLogDomainObject();
		const schemaObject = AuditLogMapper.toPersistence(domainObject);

		expect(schemaObject.id).toBe(domainObject.idValue);
		expect(schemaObject.executorId).toBe(domainObject.executorIdValue);
		expect(schemaObject.targetId).toBe(domainObject.targetIdValue);
		expect(schemaObject.actionType).toBe(domainObject.actionTypeValue);
		expect(schemaObject.changes).toBe(domainObject.changes as unknown as InputJsonValue[]);
	});
});
