import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletMapper } from "@/modules/wallet/src/mappers/walletMapper";
import type { QueryOptions } from "@/shared/constant";
import { db } from "@/shared/infrastructure/database";

export interface WalletHydrateOption {
	user?: boolean;
}

export interface IWalletRepository {
	findWalletById(
		userId: string,
		options?: QueryOptions,
		hydrate?: WalletHydrateOption,
	): Promise<IWallet | null>;
	findWalletsByIds(
		userIds: string[],
		options?: QueryOptions,
		hydrate?: WalletHydrateOption,
	): Promise<IWallet[]>;
}

export class WalletRepository implements IWalletRepository {
	private _database;
	private _mapper;

	constructor(database = db.userWallet, mapper = WalletMapper) {
		this._database = database;
		this._mapper = mapper;
	}

	async findWalletById(
		id: string,
		options?: QueryOptions,
		hydrate?: WalletHydrateOption,
	): Promise<IWallet | null> {
		const wallets = await this.findWalletsByIds([id], options, hydrate);

		if (wallets.length === 0) {
			return null;
		}

		return wallets[0];
	}

	public async findWalletsByIds(
		ids: string[],
		options?: QueryOptions,
		hydrate?: WalletHydrateOption,
	): Promise<IWallet[]> {
		const usersRaw = await this._database.findMany({
			where: {
				id: { in: ids },
				...this._deletedFilter(options?.includeDeleted),
			},
			include: {
				user: hydrate?.user ?? false,
			},
		});

		return usersRaw.map((user) => this._mapper.toDomain(user));
	}

	private _deletedFilter(includeDeleted?: boolean) {
		if (includeDeleted) return {};

		return {
			isDeleted: false,
		};
	}
}
