import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletFactory } from "@/modules/wallet/src/domain/factory";
import type {
	IWalletRawObject,
	IWalletSchemaObject,
} from "@/modules/wallet/src/domain/shared/constant";
import { Prisma } from "@prisma/client";

export class WalletMapper {
	public static toDomain(rawData: IWalletRawObject): IWallet {
		return WalletFactory.create({
			...rawData,
			balance:
				rawData.balance instanceof Prisma.Decimal
					? rawData.balance.toNumber()
					: (rawData.balance ?? 0),
		}).getValue();
	}

	public static toPersistence(wallet: IWallet): IWalletSchemaObject {
		return {
			id: wallet.idValue,
			balance: wallet.balanceValue,
			isDeleted: wallet.isDeleted,
			deletedAt: wallet.deletedAt,
			createdAt: wallet.createdAt,
			updatedAt: wallet.updatedAt,
		};
	}
}
