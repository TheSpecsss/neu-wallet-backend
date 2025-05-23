import {
	type ITransactionRawObject,
	TRANSACTION_STATUS,
	TRANSACTION_TYPE,
} from "@/modules/transaction/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { db } from "@/shared/infrastructure/database";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

export const seedTransaction = async (
	partialSchemaObject: Partial<ITransactionRawObject> = {},
): Promise<ITransactionRawObject> => {
	const defaultSchemaObject = {
		id: new SnowflakeID().toString(),
		senderId: new SnowflakeID().toString(),
		receiverId: new SnowflakeID().toString(),
		amount: new Prisma.Decimal(faker.number.float({ min: 1, max: Number.MAX_SAFE_INTEGER })),
		type: faker.helpers.arrayElement(Object.values(TRANSACTION_TYPE)),
		status: faker.helpers.arrayElement(Object.values(TRANSACTION_STATUS)),
		createdAt: new Date(),
	};

	return await db.userTransaction.create({
		data: { ...defaultSchemaObject, ...partialSchemaObject },
	});
};
