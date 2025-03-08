import { describe, expect, it } from "bun:test";
import { AuditLogActionType } from "@/modules/auditLog/src/domain/classes/auditLogActionType";
import { ACTION_TYPE } from "@/modules/auditLog/src/domain/shared/constant";
import { faker } from "@faker-js/faker";

describe("AuditLogActionType", () => {
	it("should successfully create a AuditLogActionType instance with a valid type", () => {
		const type = faker.helpers.arrayElement(Object.values(ACTION_TYPE));
		const result = AuditLogActionType.create(type);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(AuditLogActionType);
		expect(result.getValue().value).toBe(type);
	});

	it("should return an error when creating a AuditLogActionType with an invalid type", () => {
		const type = "invalid-audit-log-action-type";
		const result = AuditLogActionType.create(type);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(`${type} is invalid audit log action type`);
	});
});
