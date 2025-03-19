import { CreateTransactionService } from "@/modules/transaction/src/domain/services/createTransactionService";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { UserService } from "@/modules/user/src";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { MINIMUM_TOPUP_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import type { topUpByIDDTO } from "@/modules/wallet/src/dtos/walletDTO";
import { WalletRepository } from "@/modules/wallet/src/repositories/walletRepository";

export class TopUpByIDUseCase {
	constructor(
		private _createTransactionService = new CreateTransactionService(),
		private _userService = new UserService(),
		private _walletRepository = new WalletRepository(),
	) {}

	public async execute(dto: topUpByIDDTO): Promise<IWallet> {
		const { receiverId, topUpCashierId, amount } = dto;

		await this._validateMinimumTopUpAmount(amount);
		await this._validateTopUpCashier(topUpCashierId);
		await this._ensureReceiverExist(receiverId);

		const wallet = await this._getWalletByUserId(receiverId);

		wallet.addBalance(amount);

		const updatedWallet = await this._walletRepository.update(wallet);

		await this._createTransaction(receiverId, topUpCashierId, amount);

		return updatedWallet;
	}

	private async _validateMinimumTopUpAmount(amount: number): Promise<void> {
		if (amount < MINIMUM_TOPUP_AMOUNT) {
			throw new Error(`The amount to be topped up must be at least ${MINIMUM_TOPUP_AMOUNT}`);
		}
	}

	private async _ensureReceiverExist(receiverId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId: receiverId });
		if (!user) {
			throw new Error(`Receiver ${receiverId} does not exist`);
		}
	}

	private async _validateTopUpCashier(topUpCashierId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId: topUpCashierId });
		if (!user) {
			throw new Error(`Cashier ${topUpCashierId} does not exist`);
		}

		if (user.accountTypeValue !== USER_ACCOUNT_TYPE.CASH_TOP_UP) {
			throw new Error(`User ${topUpCashierId} is not a top up cashier`);
		}
	}

	private async _getWalletByUserId(userId: string): Promise<IWallet> {
		const wallet = await this._walletRepository.findWalletByUserId(userId);
		if (!wallet) {
			throw new Error(`User ${userId} wallet does not exist`);
		}

		return wallet;
	}

	private async _createTransaction(
		receiverId: string,
		senderId: string,
		amount: number,
	): Promise<void> {
		await this._createTransactionService.createTransaction({
			receiverId,
			senderId,
			amount,
			type: TRANSACTION_TYPE.DEPOSIT,
		});
	}
}
