import { CreateTransactionService } from "@/modules/transaction/src/domain/services/createTransactionService";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { UserService } from "@/modules/user/src";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { MINIMUM_WITHDRAW_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import type { WithdrawBalanceByUserIdDTO } from "@/modules/wallet/src/dtos/walletDTO";
import { WalletRepository } from "@/modules/wallet/src/repositories/walletRepository";

export class WithdrawBalanceByUserIdUseCase {
	constructor(
		private _createTransactionService = new CreateTransactionService(),
		private _userRoleManagementService = new UserRoleManagementService(),
		private _userService = new UserService(),
		private _walletRepository = new WalletRepository(),
	) {}

	public async execute(dto: WithdrawBalanceByUserIdDTO): Promise<IWallet> {
		const { senderId, topUpCashierId, amount } = dto;

		await this._validateMinimumWithdrawAmount(amount);
		await this._ensureSenderIsNotSendingToThemselves(senderId, topUpCashierId);
		await this._ensureUserExist(senderId);
		await this._ensureReceiverIsCashierTopUp(topUpCashierId);

		const senderWallet = await this._getWalletByUserId(senderId);

		await this._ensureSenderHaveEnoughMoney(senderId, senderWallet.balanceValue, amount);

		senderWallet.reduceBalance(amount);

		const updatedWallet = await this._updateWallet(senderWallet);

		await this._createTransaction(senderId, topUpCashierId, amount);

		return updatedWallet;
	}

	private async _validateMinimumWithdrawAmount(amount: number): Promise<void> {
		if (amount < MINIMUM_WITHDRAW_AMOUNT) {
			throw new Error(`The amount to be withdrawn must be at least ${MINIMUM_WITHDRAW_AMOUNT}`);
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

	private async _ensureReceiverIsCashierTopUp(topUpCashierId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId: topUpCashierId });
		if (!user) {
			throw new Error(`User ${topUpCashierId} does not exist`);
		}

		const hasPermission = await this._userRoleManagementService.hasPermission(
			topUpCashierId,
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

	private async _ensureSenderHaveEnoughMoney(
		senderId: string,
		balance: number,
		amount: number,
	): Promise<void> {
		if (balance - amount < 0) {
			throw new Error(`User ${senderId} does not have sufficient balance`);
		}
	}

	private async _updateWallet(wallet: IWallet): Promise<IWallet> {
		const updatedWallet = await this._walletRepository.update(wallet);
		if (!updatedWallet) {
			throw new Error("Something went wrong while updating wallet");
		}

		return updatedWallet;
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
			type: TRANSACTION_TYPE.WITHDRAW,
		});
	}
}
