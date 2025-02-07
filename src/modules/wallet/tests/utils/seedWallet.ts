import type { IWalletRawObject } from "@/modules/wallet/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { db } from "@/shared/infrastructure/database";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

export const seedWallet = async (
	partialSchemaObject: Partial<IWalletRawObject> = {},
): Promise<IWalletRawObject> => {
	const defaultSchemaObject = {
		id: new SnowflakeID().toString(),
		balance: new Prisma.Decimal(faker.number.float({ min: 0 })),
		isDeleted: false,
		deletedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return db.userWallet.create({
		data: { ...defaultSchemaObject, ...partialSchemaObject },
	});
};
