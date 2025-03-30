import { WalletBalance } from "@/modules/wallet/src/domain/classes/walletBalance";
import type { IWalletRawObject } from "@/modules/wallet/src/domain/shared/constant";
import { Decimal } from "@/shared/domain/decimal";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { db } from "@/shared/infrastructure/database";
import { faker } from "@faker-js/faker";

export const seedWallet = async (
	partialSchemaObject: Partial<IWalletRawObject> = {},
): Promise<IWalletRawObject> => {
	const defaultSchemaObject = {
		id: new SnowflakeID().toString(),
		userId: new SnowflakeID().toString(),
		balance: new Decimal(
			faker.number.int({ min: WalletBalance.MINIMUM_BALANCE_AMOUNT, max: Number.MAX_SAFE_INTEGER }),
		),
		isDeleted: false,
		deletedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return await db.userWallet.create({
		data: { ...defaultSchemaObject, ...partialSchemaObject },
	});
};
