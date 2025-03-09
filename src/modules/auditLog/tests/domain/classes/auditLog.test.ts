import { describe, expect, it } from "bun:test";
import { AuditLog, type IAuditLogData } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogActionType } from "@/modules/auditLog/src/domain/classes/auditLogActionType";
import { ACTION_TYPE } from "@/modules/auditLog/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("AuditLog", () => {
	const mockData: IAuditLogData = {
		id: new SnowflakeID(),
		executorId: new SnowflakeID(),
		executor: null,
		targetId: new SnowflakeID(),
		target: null,
		actionType: AuditLogActionType.create(
			faker.helpers.arrayElement(Object.values(ACTION_TYPE)),
		).getValue(),
		changes: [],
		createdAt: new Date(),
	};

	it("should create a AuditLog", () => {
		const auditLog = AuditLog.create(mockData);

		expect(auditLog).toBeInstanceOf(AuditLog);
		expect(auditLog.id).toBe(mockData.id);
		expect(auditLog.executorId).toBe(mockData.executorId);
		expect(auditLog.executor).toBe(mockData.executor);
		expect(auditLog.targetId).toBe(mockData.targetId);
		expect(auditLog.target).toBe(mockData.target);
		expect(auditLog.actionType).toBe(mockData.actionType);
		expect(auditLog.changes).toBe(mockData.changes);
	});
});
