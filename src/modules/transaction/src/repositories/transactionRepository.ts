import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { TransactionMapper } from "@/modules/transaction/src/mappers/transactionMapper";
import { UserService } from "@/modules/user/src";
import type { Pagination } from "@/shared/constant";
import { db } from "@/shared/infrastructure/database";

export interface TransactionHydrateOption {
	sender?: boolean;
	receiver?: boolean;
}

export interface ITransactionRepository {
	findTransactionById(id: string, hydrate?: TransactionHydrateOption): Promise<ITransaction | null>;
	findTransactionsByIds(ids: string[], hydrate?: TransactionHydrateOption): Promise<ITransaction[]>;
	getTransactionsByPagination(
		userId: string,
		pagination: Pagination,
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction[]>;
	getTransactionsByUserIdTotalPages(userId: string, perPage: number): Promise<number>;
	getCashierTransactionsByPagination(
		pagination: Pagination,
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction[]>;
	getCashierTransactionsTotalPages(perPage: number): Promise<number>;
	getCashierTopUpTransactionsByPagination(
		pagination: Pagination,
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction[]>;
	getCashierTopUpTransactionsTotalPages(perPage: number): Promise<number>;
	save(transaction: ITransaction): Promise<ITransaction>;
	update(transaction: ITransaction): Promise<ITransaction>;
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

	public async getCashierTransactionsByPagination(
		pagination: Pagination,
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction[]> {
		const transactionsRaw = await this._database.findMany({
			where: {
				OR: [
					{ sender: { accountType: UserService.ACCOUNT_TYPE.CASHIER } },
					{ receiver: { accountType: UserService.ACCOUNT_TYPE.CASHIER } },
				],
			},
			skip: pagination.start,
			take: pagination.size,
			include: this._hydrateFilter(hydrate),
			orderBy: [{ createdAt: "desc" }],
		});

		return transactionsRaw.map((transaction) => this._mapper.toDomain(transaction));
	}

	public async getCashierTransactionsTotalPages(perPage: number): Promise<number> {
		const totalCount = await this._database.count({
			where: {
				OR: [
					{ sender: { accountType: UserService.ACCOUNT_TYPE.CASHIER } },
					{ receiver: { accountType: UserService.ACCOUNT_TYPE.CASHIER } },
				],
			},
		});

		return Math.ceil(totalCount / perPage);
	}

	public async getCashierTopUpTransactionsByPagination(
		pagination: Pagination,
		hydrate?: TransactionHydrateOption,
	): Promise<ITransaction[]> {
		const transactionsRaw = await this._database.findMany({
			where: {
				AND: [
					{
						OR: [
							{ sender: { accountType: UserService.ACCOUNT_TYPE.CASH_TOP_UP } },
							{ receiver: { accountType: UserService.ACCOUNT_TYPE.CASH_TOP_UP } },
						],
					},
					{ OR: [{ type: TRANSACTION_TYPE.DEPOSIT }, { type: TRANSACTION_TYPE.WITHDRAW }] },
				],
			},
			skip: pagination.start,
			take: pagination.size,
			include: this._hydrateFilter(hydrate),
			orderBy: [{ createdAt: "desc" }],
		});

		return transactionsRaw.map((transaction) => this._mapper.toDomain(transaction));
	}

	public async getCashierTopUpTransactionsTotalPages(perPage: number): Promise<number> {
		const totalCount = await this._database.count({
			where: {
				AND: [
					{
						OR: [
							{ sender: { accountType: UserService.ACCOUNT_TYPE.CASH_TOP_UP } },
							{ receiver: { accountType: UserService.ACCOUNT_TYPE.CASH_TOP_UP } },
						],
					},
					{ OR: [{ type: TRANSACTION_TYPE.DEPOSIT }, { type: TRANSACTION_TYPE.WITHDRAW }] },
				],
			},
		});

		return Math.ceil(totalCount / perPage);
	}

	public async save(transaction: ITransaction): Promise<ITransaction> {
		const transactionRaw = await this._database.create({
			data: this._mapper.toPersistence(transaction),
		});

		return this._mapper.toDomain(transactionRaw);
	}

	public async update(transaction: ITransaction): Promise<ITransaction> {
		const transactionRaw = await this._database.update({
			where: { id: transaction.idValue },
			data: this._mapper.toPersistence(transaction),
		});

		return this._mapper.toDomain(transactionRaw);
	}

	private _hydrateFilter(hydrate?: TransactionHydrateOption) {
		return {
			sender: hydrate?.sender ?? true,
			receiver: hydrate?.receiver ?? true,
		};
	}
}
