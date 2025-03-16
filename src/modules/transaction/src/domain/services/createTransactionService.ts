import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionFactory } from "@/modules/transaction/src/domain/factory";
import type { CreateTransactionServiceDTO } from "@/modules/transaction/src/dtos/transactionServiceDTO";
import { TransactionRepository } from "@/modules/transaction/src/repositories/transactionRepository";
import { UserService } from "@/modules/user/src";

export class CreateTransactionService {
	constructor(
		private _transactionRepository = new TransactionRepository(),
		private _userService = new UserService(),
	) {}

	public async createTransaction(dto: CreateTransactionServiceDTO): Promise<ITransaction> {
		await this._ensureUserExist(dto.senderId);
		await this._ensureUserExist(dto.receiverId);

		const transaction = this._createTransactionDomain(dto);

		const savedTransaction = await this._transactionRepository.save(transaction);

		return savedTransaction;
	}

	private async _ensureUserExist(userId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId });
		if (!user) {
			throw new Error(`User ${userId} does not exist`);
		}
	}

	private _createTransactionDomain({
		senderId,
		receiverId,
		amount,
		type,
	}: CreateTransactionServiceDTO): ITransaction {
		const transaction = TransactionFactory.create({
			senderId,
			receiverId,
			amount,
			type,
			createdAt: new Date(),
		});
		if (transaction.isFailure) {
			throw new Error(`Failed to create transaction: ${transaction.getErrorMessage()}`);
		}

		return transaction.getValue();
	}
}
