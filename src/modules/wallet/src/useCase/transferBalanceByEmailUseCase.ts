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
		const { senderEmail, receiverId, amount } = dto;

		await this._validateMinimumTransferAmount(amount);
		await this._ensureReceiverExist(receiverId);

		const sender = await this._getSenderByEmail(senderEmail, receiverId);
		const receiverWallet = await this._getWalletByUserId(receiverId);

		await this._ensureSenderHaveEnoughMoney(senderEmail, sender.wallet!.balanceValue, amount);

		sender.wallet!.reduceBalance(amount);
		receiverWallet.addBalance(amount);

		const [updatedSenderWallet, updatedReceiverWallet] = await this._updateWallets([
			sender.wallet!,
			receiverWallet,
		]);

		await this._createTransaction(sender.idValue, receiverId, amount);

		return { senderWallet: updatedSenderWallet, receiverWallet: updatedReceiverWallet };
	}

	private async _validateMinimumTransferAmount(amount: number): Promise<void> {
		if (amount < MINIMUM_TRANSFER_AMOUNT) {
			throw new Error(`The transfer amount must be at least ${MINIMUM_TRANSFER_AMOUNT}`);
		}
	}

	private async _getSenderByEmail(email: string, receiverId: string): Promise<IUser> {
		const user = await this._userService.findUserByEmail({ email });
		if (!user) {
			throw new Error(`User ${email} does not exist`);
		}

		if (user?.idValue === receiverId) {
			throw new Error("You cannot send to yourself");
		}

		if (!user?.wallet) {
			throw new Error(`User ${email} wallet does not exist`);
		}

		return user;
	}

	private async _ensureReceiverExist(receiverId: string): Promise<IUser> {
		const user = await this._userService.findUserById({ userId: receiverId });
		if (!user) {
			throw new Error(`User ${receiverId} does not exist`);
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

	private async _ensureSenderHaveEnoughMoney(
		senderEmail: string,
		balance: number,
		amount: number,
	): Promise<void> {
		if (balance - amount < 0) {
			throw new Error(`User ${senderEmail} does not have sufficient balance`);
		}
	}

	private async _updateWallets(wallets: IWallet[]): Promise<IWallet[]> {
		const updatedWallets = await this._walletRepository.updateMany(wallets);
		if (updatedWallets.length !== wallets.length) {
			throw new Error("Some wallet failed to update");
		}

		return updatedWallets;
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
