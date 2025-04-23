import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionFactory } from "@/modules/transaction/src/domain/factory";
import {
	type ITransactionRawObject,
	TRANSACTION_STATUS,
	TRANSACTION_TYPE,
} from "@/modules/transaction/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { defaultTo } from "rambda";

export const createTransactionDomainObject = (
	partialDomainObject: Partial<ITransactionRawObject> = {},
): ITransaction => {
	const defaultDomainObject = {
		id: new SnowflakeID().toString(),
		senderId: new SnowflakeID().toString(),
		receiverId: new SnowflakeID().toString(),
		amount: new Prisma.Decimal(
			faker.number.float({
				min: 1,
				max: Number.MAX_SAFE_INTEGER,
			}),
		),
		type: faker.helpers.arrayElement(Object.values(TRANSACTION_TYPE)),
		status: faker.helpers.arrayElement(Object.values(TRANSACTION_STATUS)),
		createdAt: new Date(),
	};

	return TransactionFactory.create({
		...defaultDomainObject,
		...partialDomainObject,
		amount: defaultTo(
			defaultDomainObject.amount.toNumber(),
			partialDomainObject.amount?.toNumber(),
		),
	}).getValue();
};
