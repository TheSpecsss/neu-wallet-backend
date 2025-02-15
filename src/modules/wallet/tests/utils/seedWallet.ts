import { WalletBalance } from "@/modules/wallet/src/domain/classes/walletBalance";
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
		userId: new SnowflakeID().toString(),
		balance: new Prisma.Decimal(faker.number.float({ min: WalletBalance.MINIMUM_BALANCE_AMOUNT })),
		isDeleted: false,
		deletedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return await db.userWallet.create({
		data: { ...defaultSchemaObject, ...partialSchemaObject },
	});
};
