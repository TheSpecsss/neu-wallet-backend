import { CreateTransactionService } from "@/modules/transaction/src/domain/services/createTransactionService";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { UserService } from "@/modules/user/src";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { MINIMUM_TOPUP_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import type { TopUpByUserIdDTO } from "@/modules/wallet/src/dtos/walletDTO";
import { WalletRepository } from "@/modules/wallet/src/repositories/walletRepository";

export class TopUpByUserIdUseCase {
	constructor(
		private _createTransactionService = new CreateTransactionService(),
		private _userService = new UserService(),
		private _userRoleManagementService = new UserRoleManagementService(),
		private _walletRepository = new WalletRepository(),
	) {}

	public async execute(dto: TopUpByUserIdDTO): Promise<IWallet> {
		const { receiverId, topUpCashierId, amount } = dto;

		await this._validateMinimumTopUpAmount(amount);
		await this._validateTopUpCashier(topUpCashierId);
		await this._ensureReceiverExist(receiverId);

		const wallet = await this._getWalletByUserId(receiverId);

		wallet.addBalance(amount);

		const updatedWallet = await this._updateWallet(wallet);

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
			throw new Error(`User ${receiverId} does not exist`);
		}
	}

	private async _validateTopUpCashier(topUpCashierId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId: topUpCashierId });

		if (!user) {
			throw new Error(`User ${topUpCashierId} does not exist`);
		}

		const hasPermission = await this._userRoleManagementService.hasPermission(
			user,
			USER_ACCOUNT_TYPE.CASH_TOP_UP,
		);
		if (!hasPermission) {
			throw new Error(`User ${topUpCashierId} does not have the required permission`);
		}
	}

	private async _getWalletByUserId(userId: string): Promise<IWallet> {
		const wallet = await this._walletRepository.findWalletByUserId(userId);
		if (!wallet) {
			throw new Error(`User ${userId} wallet does not exist`);
		}

		return wallet;
	}

	private async _updateWallet(wallet: IWallet) {
		const updatedWallet = await this._walletRepository.update(wallet);
		if (!updatedWallet) {
			throw new Error("Something went wrong while updating wallet");
		}

		return updatedWallet;
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
