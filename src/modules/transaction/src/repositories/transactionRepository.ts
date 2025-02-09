import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionMapper } from "@/modules/transaction/src/mappers/transactionMapper";
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
		const transaction = await this.findTransactionsByIds([id], hydrate);

		if (transaction.length === 0) {
			return null;
		}

		return transaction[0];
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

	private _hydrateFilter(hydrate?: TransactionHydrateOption) {
		return {
			sender: hydrate?.sender ?? false,
			receiver: hydrate?.receiver ?? false,
		};
	}
}
