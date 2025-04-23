import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionFactory } from "@/modules/transaction/src/domain/factory";
import { TRANSACTION_STATUS } from "@/modules/transaction/src/domain/shared/constant";
import type {
	CreateTransactionServiceDTO,
	ExecuteTransactionCallback,
} from "@/modules/transaction/src/dtos/transactionServiceDTO";
import { TransactionRepository } from "@/modules/transaction/src/repositories/transactionRepository";
import { UserService } from "@/modules/user/src";

export class CreateTransactionService {
	constructor(
		private _transactionRepository = new TransactionRepository(),
		private _userService = new UserService(),
	) {}

	public async createTransaction(dto: CreateTransactionServiceDTO): Promise<ITransaction> {
		await this._validateUsers(dto.senderId, dto.receiverId);
		const transactionDomain = this._createTransactionDomain(this._prepareTransactionData(dto));
		return await this._saveTransaction(transactionDomain);
	}

	public async executeTransaction<T>(
		dto: CreateTransactionServiceDTO,
		callback: ExecuteTransactionCallback<T>,
	): Promise<T> {
		const transaction = await this.createTransaction(dto);

		try {
			const result = await callback(transaction);
			await this._markTransactionSuccessful(transaction);
			return result;
		} catch (error) {
			await this._markTransactionFailed(transaction);
			throw error;
		}
	}

	private async _validateUsers(senderId: string, receiverId: string): Promise<void> {
		await this._ensureUserExist(senderId);
		await this._ensureUserExist(receiverId);
	}

	private _prepareTransactionData(dto: CreateTransactionServiceDTO): CreateTransactionServiceDTO {
		return {
			...dto,
			status: dto.status || TRANSACTION_STATUS.PROCESSING,
		};
	}

	private async _saveTransaction(transaction: ITransaction): Promise<ITransaction> {
		return await this._transactionRepository.save(transaction);
	}

	private async _markTransactionSuccessful(transaction: ITransaction): Promise<void> {
		transaction.updateStatus(TRANSACTION_STATUS.SUCCESS);
		await this._transactionRepository.update(transaction);
	}

	private async _markTransactionFailed(transaction: ITransaction): Promise<void> {
		transaction.updateStatus(TRANSACTION_STATUS.FAILED);
		await this._transactionRepository.update(transaction);
	}

	private async _ensureUserExist(userId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId });
		if (!user) {
			throw new Error(`User ${userId} does not exist`);
		}
	}

	private _createTransactionDomain(dto: CreateTransactionServiceDTO): ITransaction {
		const transaction = TransactionFactory.create({
			senderId: dto.senderId,
			receiverId: dto.receiverId,
			amount: dto.amount,
			type: dto.type,
			status: dto.status || TRANSACTION_STATUS.PROCESSING,
			createdAt: new Date(),
		});

		if (transaction.isFailure) {
			throw new Error(`Failed to create transaction: ${transaction.getErrorMessage()}`);
		}

		return transaction.getValue();
	}
}
