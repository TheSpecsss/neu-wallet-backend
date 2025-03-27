import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletMapper } from "@/modules/wallet/src/mappers/walletMapper";
import type { QueryOptions } from "@/shared/constant";
import { db } from "@/shared/infrastructure/database";

export interface WalletHydrateOption {
	user?: boolean;
}

export interface IWalletRepository {
	findWalletById(
		id: string,
		options?: QueryOptions,
		hydrate?: WalletHydrateOption,
	): Promise<IWallet | null>;
	findWalletsByIds(
		ids: string[],
		options?: QueryOptions,
		hydrate?: WalletHydrateOption,
	): Promise<IWallet[]>;
	findWalletByUserId(
		userId: string,
		options?: QueryOptions,
		hydrate?: WalletHydrateOption,
	): Promise<IWallet | null>;
	update(wallet: IWallet, hydrate?: WalletHydrateOption): Promise<IWallet | null>;
	updateMany(wallets: IWallet[], hydrate?: WalletHydrateOption): Promise<IWallet[]>;
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
		if (!wallets[0]) {
			return null;
		}

		return wallets[0];
	}

	public async findWalletsByIds(
		ids: string[],
		options?: QueryOptions,
		hydrate?: WalletHydrateOption,
	): Promise<IWallet[]> {
		const walletsRaw = await this._database.findMany({
			where: {
				id: { in: ids },
				...this._deletedFilter(options?.includeDeleted),
			},
			include: this._hydrateFilter(hydrate),
		});

		return walletsRaw.map((wallet) => this._mapper.toDomain(wallet));
	}

	public async findWalletByUserId(
		userId: string,
		options?: QueryOptions,
		hydrate?: WalletHydrateOption,
	): Promise<IWallet | null> {
		const wallet = await this._database.findFirst({
			where: {
				userId,
				...this._deletedFilter(options?.includeDeleted),
			},
			include: this._hydrateFilter(hydrate),
		});
		if (!wallet) {
			return null;
		}

		return this._mapper.toDomain(wallet);
	}

	public async update(wallet: IWallet, hydrate?: WalletHydrateOption): Promise<IWallet | null> {
		const wallets = await this.updateMany([wallet], hydrate);
		if (wallets.length !== 1) {
			return null;
		}

		return wallets[0];
	}

	public async updateMany(wallets: IWallet[], hydrate?: WalletHydrateOption): Promise<IWallet[]> {
		try {
			const walletsRaw = await db.$transaction(
				wallets.map((wallet) =>
					this._database.update({
						where: { id: wallet.idValue },
						data: this._mapper.toPersistence(wallet),
						include: this._hydrateFilter(hydrate),
					}),
				),
			);

			return walletsRaw.map((walletRaw) => this._mapper.toDomain(walletRaw));
		} catch (error) {
			return [];
		}
	}

	private _deletedFilter(includeDeleted?: boolean) {
		if (includeDeleted) return {};

		return {
			isDeleted: false,
		};
	}

	private _hydrateFilter(hydrate?: WalletHydrateOption) {
		return {
			user: hydrate?.user ?? true,
		};
	}
}
