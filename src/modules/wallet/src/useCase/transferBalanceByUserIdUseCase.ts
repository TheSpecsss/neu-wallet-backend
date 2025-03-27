import { CreateTransactionService } from "@/modules/transaction/src/domain/services/createTransactionService";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { UserService } from "@/modules/user/src";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { MINIMUM_PAY_AMOUNT, MINIMUM_TRANSFER_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import type { TransferBalanceByUserIdDTO } from "@/modules/wallet/src/dtos/walletDTO";
import { WalletRepository } from "@/modules/wallet/src/repositories/walletRepository";

export class TransferBalanceByUserIdUseCase {
	constructor(
		private _createTransactionService = new CreateTransactionService(),
		private _userService = new UserService(),
		private _walletRepository = new WalletRepository(),
	) {}

	public async execute(
		dto: TransferBalanceByUserIdDTO,
	): Promise<{ senderWallet: IWallet; receiverWallet: IWallet }> {
		const { senderId, receiverId, amount } = dto;

		await this._validateMinimumTransferAmount(amount);
		await this._ensureSenderIsNotSendingToThemselves(senderId, receiverId);
		await this._ensureUserExist(senderId);
		await this._ensureUserExist(receiverId);

		const senderWallet = await this._getWalletByUserId(senderId);
		const receiverWallet = await this._getWalletByUserId(receiverId);

		await this._ensureSenderHaveEnoughMoney(senderId, senderWallet.balanceValue, amount);

		senderWallet.reduceBalance(amount);
		receiverWallet.addBalance(amount);

		await this._walletRepository.updateMany([senderWallet, receiverWallet]);

		await this._createTransaction(senderId, receiverId, amount);

		return { senderWallet, receiverWallet };
	}

	private async _validateMinimumTransferAmount(amount: number): Promise<void> {
		if (amount < MINIMUM_TRANSFER_AMOUNT) {
			throw new Error(`The amount to be transfer must be at least ${MINIMUM_TRANSFER_AMOUNT}`);
		}
	}

	private async _ensureSenderIsNotSendingToThemselves(senderId: string, receiverId: string) {
		if (senderId === receiverId) {
			throw new Error("You cannot send to yourself");
		}
	}

	private async _ensureUserExist(userId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId });
		if (!user) {
			throw new Error(`User ${userId} does not exist`);
		}
	}

	private async _getWalletByUserId(userId: string): Promise<IWallet> {
		const wallet = await this._walletRepository.findWalletByUserId(userId);
		if (!wallet) {
			throw new Error(`User ${userId} wallet does not exist`);
		}

		return wallet;
	}

	private async _ensureSenderHaveEnoughMoney(
		senderId: string,
		balance: number,
		amount: number,
	): Promise<void> {
		if (balance - amount < 0) {
			throw new Error(`User ${senderId} does not have sufficient balance`);
		}
	}

	private async _createTransaction(
		senderId: string,
		receiverId: string,
		amount: number,
	): Promise<void> {
		await this._createTransactionService.createTransaction({
			senderId,
			receiverId,
			amount,
			type: TRANSACTION_TYPE.TRANSFER,
		});
	}
}
