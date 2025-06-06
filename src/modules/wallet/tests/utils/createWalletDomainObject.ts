import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletBalance } from "@/modules/wallet/src/domain/classes/walletBalance";
import { WalletFactory } from "@/modules/wallet/src/domain/factory";
import type { IWalletRawObject } from "@/modules/wallet/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";
import { defaultTo } from "rambda";

export const createWalletDomainObject = (
	partialDomainObject: Partial<IWalletRawObject> = {},
): IWallet => {
	const defaultDomainObject = {
		id: new SnowflakeID().toString(),
		userId: new SnowflakeID().toString(),
		user: null,
		balance: faker.number.int({
			min: WalletBalance.MINIMUM_BALANCE_AMOUNT,
			max: Number.MAX_SAFE_INTEGER,
		}),
		isDeleted: false,
		deletedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return WalletFactory.create({
		...defaultDomainObject,
		...partialDomainObject,
		balance:
			partialDomainObject.balance instanceof Prisma.Decimal
				? partialDomainObject.balance.toNumber()
				: defaultTo(defaultDomainObject.balance, partialDomainObject.balance),
	}).getValue();
};
