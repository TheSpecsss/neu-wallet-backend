import { CreateTransactionService } from "@/modules/transaction/src/domain/services/createTransactionService";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { UserService } from "@/modules/user/src";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { MINIMUM_TRANSFER_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import type { TransferBalanceByEmailDTO } from "@/modules/wallet/src/dtos/walletDTO";
import { WalletRepository } from "@/modules/wallet/src/repositories/walletRepository";

export class TransferBalanceByEmailUseCase {
	constructor(
		private _createTransactionService = new CreateTransactionService(),
		private _userService = new UserService(),
		private _walletRepository = new WalletRepository(),
	) {}

	public async execute(
		dto: TransferBalanceByEmailDTO,
	): Promise<{ senderWallet: IWallet; receiverWallet: IWallet }> {
		const { senderId, receiverEmail, amount } = dto;

		const receiver = await this._getReceiverByEmail(receiverEmail);

		await this._validateRequest({ senderId, receiverId: receiver.idValue, amount });

		return await this._createTransactionService.executeTransaction(
			{
				senderId,
				receiverId: receiver.idValue,
				amount,
				type: TRANSACTION_TYPE.TRANSFER,
			},
			async () => this._performTransfer(senderId, receiver.idValue, amount),
		);
	}

	private async _validateRequest({
		amount,
		receiverId,
		senderId,
	}: { amount: number; receiverId: string; senderId: string }): Promise<void> {
		this._validateMinimumTransferAmount(amount);
		this._ensureSenderIsNotSendingToThemselves(senderId, receiverId);
		await this._ensureSenderExist(senderId);
	}

	private _validateMinimumTransferAmount(amount: number): void {
		if (amount < MINIMUM_TRANSFER_AMOUNT) {
			throw new Error(`The transfer amount must be at least ${MINIMUM_TRANSFER_AMOUNT}`);
		}
	}

	private _ensureSenderIsNotSendingToThemselves(senderId: string, receiverId: string): void {
		if (senderId === receiverId) {
			throw new Error("You cannot send to yourself");
		}
	}

	private async _ensureSenderExist(senderId: string): Promise<IUser> {
		const user = await this._userService.findUserById({ userId: senderId });
		if (!user) {
			throw new Error(`User ${senderId} does not exist`);
		}

		return user;
	}

	private async _performTransfer(
		senderId: string,
		receiverId: string,
		amount: number,
	): Promise<{ senderWallet: IWallet; receiverWallet: IWallet }> {
		const senderWallet = await this._getWalletByUserId(senderId);
		const receiverWallet = await this._getWalletByUserId(receiverId);

		this._ensureSenderHaveEnoughMoney(senderWallet.userIdValue, senderWallet.balanceValue, amount);

		senderWallet.reduceBalance(amount);
		receiverWallet.addBalance(amount);

		const updatedWallets = await this._updateWallets([senderWallet, receiverWallet]);

		return {
			senderWallet: updatedWallets[0],
			receiverWallet: updatedWallets[1],
		};
	}

	private async _getReceiverByEmail(email: string): Promise<IUser> {
		const user = await this._userService.findUserByEmail({ email });
		if (!user) {
			throw new Error(`User ${email} does not exist`);
		}

		return user;
	}

	private async _getWalletByUserId(userId: string): Promise<IWallet> {
		const wallet = await this._walletRepository.findWalletByUserId(userId);
		if (!wallet) {
			throw new Error(`User ${userId} wallet does not exist`);
		}

		return wallet;
	}

	private _ensureSenderHaveEnoughMoney(
		senderId: string,
		balance: number,
		amount: number,
	): void {
		if (balance - amount < 0) {
			throw new Error(`User ${senderId} does not have sufficient balance`);
		}
	}

	private async _updateWallets(wallets: IWallet[]): Promise<IWallet[]> {
		const updatedWallets = await this._walletRepository.updateMany(wallets);
		if (updatedWallets.length !== wallets.length) {
			throw new Error("Some wallet failed to update");
		}

		return updatedWallets;
	}
}
