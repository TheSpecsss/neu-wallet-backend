import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogFactory } from "@/modules/auditLog/src/domain/factory";
import type { IAuditLogChange } from "@/modules/auditLog/src/domain/shared/auditLogChanges";
import {
	ACTION_TYPE,
	type IAuditLogRawObject,
} from "@/modules/auditLog/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";
import { defaultTo } from "rambda";

export const createAuditLogDomainObject = (
	partialDomainObject: Partial<IAuditLogRawObject> = {},
): IAuditLog => {
	const defaultDomainObject: IAuditLogRawObject = {
		id: new SnowflakeID().toString(),
		executorId: new SnowflakeID().toString(),
		targetId: new SnowflakeID().toString(),
		actionType: faker.helpers.arrayElement(Object.values(ACTION_TYPE)),
		changes: [],
		createdAt: new Date(),
	};

	return AuditLogFactory.create({
		...defaultDomainObject,
		...partialDomainObject,
		changes: defaultTo(
			defaultDomainObject.changes,
			partialDomainObject.changes,
		) as unknown as IAuditLogChange[],
	}).getValue();
};
