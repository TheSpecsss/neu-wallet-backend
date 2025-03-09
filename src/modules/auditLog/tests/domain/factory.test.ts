import { beforeEach, describe, expect, it } from "bun:test";
import { AuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogFactory, type IAuditLogFactory } from "@/modules/auditLog/src/domain/factory";
import { ACTION_TYPE } from "@/modules/auditLog/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("AuditLogFactory", () => {
	let mockData: IAuditLogFactory;

	beforeEach(() => {
		mockData = {
			id: new SnowflakeID().toString(),
			executorId: new SnowflakeID().toString(),
			targetId: new SnowflakeID().toString(),
			actionType: faker.helpers.arrayElement(Object.values(ACTION_TYPE)),
			changes: [],
			createdAt: faker.date.past(),
		};
	});

	it("should successfully create a AuditLog when all properties are valid", () => {
		const result = AuditLogFactory.create(mockData);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(AuditLog);

		const user = result.getValue();
		expect(user.idValue).toBe(mockData.id!);
		expect(user.executorIdValue).toBe(mockData.executorId);
		expect(user.targetIdValue).toBe(mockData.targetId);
		expect(user.actionTypeValue).toBe(mockData.actionType);
		expect(user.changes).toBe(mockData.changes);
		expect(user.createdAt.toString()).toBe(mockData.createdAt.toString());
	});

	it("should fail when audit log action type is invalid type", () => {
		const invalidTypeProps = { ...mockData, actionType: "invalid-audit-log-action-type" };

		const result = AuditLogFactory.create(invalidTypeProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`${invalidTypeProps.actionType} is invalid audit log action type`,
		);
	});
});
