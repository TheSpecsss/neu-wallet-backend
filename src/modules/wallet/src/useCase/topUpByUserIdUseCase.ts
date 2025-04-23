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

		await this._validateRequest(dto);

		return await this._createTransactionService.executeTransaction(
			{
				senderId: topUpCashierId,
				receiverId: receiverId,
				amount,
				type: TRANSACTION_TYPE.DEPOSIT,
			},
			async () => this._performTopUp(receiverId, amount),
		);
	}

	private async _validateRequest({
		amount,
		receiverId,
		topUpCashierId,
	}: TopUpByUserIdDTO): Promise<void> {
		this._validateMinimumTopUpAmount(amount);
		this._ensureSenderIsNotSendingToThemselves(topUpCashierId, receiverId);
		await this._validateTopUpCashier(topUpCashierId);
		await this._validateReceiver(receiverId);
	}

	private _validateMinimumTopUpAmount(amount: number): void {
		if (amount < MINIMUM_TOPUP_AMOUNT) {
			throw new Error(`The amount to be topped up must be at least ${MINIMUM_TOPUP_AMOUNT}`);
		}
	}

	private _ensureSenderIsNotSendingToThemselves(topUpCashierId: string, receiverId: string): void {
		if (topUpCashierId === receiverId) {
			throw new Error("You cannot send to yourself");
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

	private async _validateReceiver(receiverId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId: receiverId });
		if (!user) {
			throw new Error(`User ${receiverId} does not exist`);
		}
	}

	private async _performTopUp(receiverId: string, amount: number): Promise<IWallet> {
		const wallet = await this._getWalletByUserId(receiverId);

		wallet.addBalance(amount);

		return await this._updateWallet(wallet);
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
}
