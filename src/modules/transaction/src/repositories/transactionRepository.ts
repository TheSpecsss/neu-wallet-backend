import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionMapper } from "@/modules/transaction/src/mappers/transactionMapper";
import type { Pagination } from "@/shared/constant";
import { db } from "@/shared/infrastructure/database";

export interface TransactionHydrateOption {
	sender?: boolean;
	receiver?: boolean;
}

export interface ITransactionRepository {
	findTransactionById(id: string, hydrate?: TransactionHydrateOption): Promise<ITransaction | null>;
	findTransactionsByIds(
		userIds: string[],
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction[]>;
	getTransactionsByPagination(
		userId: string,
		pagination: Pagination,
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction[]>;
	getTransactionsByUserIdTotalPages(userId: string, perPage: number): Promise<number>;
}

export class TransactionRepository implements ITransactionRepository {
	private _database;
	private _mapper;

	constructor(database = db.userTransaction, mapper = TransactionMapper) {
		this._database = database;
		this._mapper = mapper;
	}

	async findTransactionById(
		id: string,
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction | null> {
		const transactions = await this.findTransactionsByIds([id], hydrate);
		if (!transactions[0]) {
			return null;
		}

		return transactions[0];
	}

	public async findTransactionsByIds(
		ids: string[],
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction[]> {
		const transactionsRaw = await this._database.findMany({
			where: { id: { in: ids } },
			include: this._hydrateFilter(hydrate),
		});

		return transactionsRaw.map((transaction) => this._mapper.toDomain(transaction));
	}

	public async getTransactionsByPagination(
		userId: string,
		pagination: Pagination,
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction[]> {
		const transactionsRaw = await this._database.findMany({
			where: { OR: [{ senderId: userId }, { receiverId: userId }] },
			skip: pagination.start,
			take: pagination.size,
			include: this._hydrateFilter(hydrate),
			orderBy: [{ createdAt: "asc" }],
		});

		return transactionsRaw.map((transaction) => this._mapper.toDomain(transaction));
	}

	public async getTransactionsByUserIdTotalPages(userId: string, perPage: number): Promise<number> {
		const totalCount = await this._database.count({
			where: { OR: [{ senderId: userId }, { receiverId: userId }] },
		});

		return Math.ceil(totalCount / perPage);
	}

	private _hydrateFilter(hydrate?: TransactionHydrateOption) {
		return {
			sender: hydrate?.sender ?? false,
			receiver: hydrate?.receiver ?? false,
		};
	}
}
