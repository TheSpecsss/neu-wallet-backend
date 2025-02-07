import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletFactory } from "@/modules/wallet/src/domain/factory";
import type { IWalletRawObject } from "@/modules/wallet/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

export const createWalletDomainObject = (
	partialDomainObject: Partial<IWalletRawObject> = {},
): IWallet => {
	const defaultDomainObject = {
		id: new SnowflakeID().toString(),
		user: null,
		balance: faker.number.float({ min: 0 }),
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
				: (partialDomainObject.balance ?? 0),
	}).getValue();
};
