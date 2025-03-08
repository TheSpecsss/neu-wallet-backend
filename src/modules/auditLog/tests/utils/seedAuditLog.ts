import {
	ACTION_TYPE,
	type IAuditLogRawObject,
} from "@/modules/auditLog/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { db } from "@/shared/infrastructure/database";
import { faker } from "@faker-js/faker";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { defaultTo } from "rambda";

export const seedAuditLog = async (
	partialSchemaObject: Partial<IAuditLogRawObject> = {},
): Promise<IAuditLogRawObject> => {
	const defaultSchemaObject: IAuditLogRawObject = {
		id: new SnowflakeID().toString(),
		executorId: new SnowflakeID().toString(),
		targetId: new SnowflakeID().toString(),
		actionType: faker.helpers.arrayElement(Object.values(ACTION_TYPE)),
		changes: [],
		createdAt: new Date(),
	};

	return await db.userAuditLog.create({
		data: {
			...defaultSchemaObject,
			...partialSchemaObject,
			changes: defaultTo(
				defaultSchemaObject.changes,
				partialSchemaObject.changes,
			) as InputJsonValue[],
		},
	});
};
