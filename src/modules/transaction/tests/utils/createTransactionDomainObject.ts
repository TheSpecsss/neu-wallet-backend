import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionAmount } from "@/modules/transaction/src/domain/classes/transactionAmount";
import { TransactionFactory } from "@/modules/transaction/src/domain/factory";
import {
	type ITransactionRawObject,
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
				min: TransactionAmount.MINIMUM_AMOUNT,
				max: Number.MAX_SAFE_INTEGER,
			}),
		),
		type: faker.helpers.arrayElement(Object.values(TRANSACTION_TYPE)),
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
