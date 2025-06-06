import { CreateTransactionService } from "@/modules/transaction/src/domain/services/createTransactionService";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import { UserService } from "@/modules/user/src";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { MINIMUM_PAY_AMOUNT } from "@/modules/wallet/src/domain/shared/constant";
import type { PayDTO } from "@/modules/wallet/src/dtos/walletDTO";
import { WalletRepository } from "@/modules/wallet/src/repositories/walletRepository";

export class PayUseCase {
	constructor(
		private _createTransactionService = new CreateTransactionService(),
		private _userService = new UserService(),
		private _walletRepository = new WalletRepository(),
		private _userRoleManagementService = new UserRoleManagementService(),
	) {}

	public async execute(dto: PayDTO): Promise<IWallet> {
		const { senderId, cashierId, amount } = dto;

		await this._validateRequest(dto);

		return await this._createTransactionService.executeTransaction(
			{
				senderId,
				receiverId: cashierId,
				amount,
				type: TRANSACTION_TYPE.PAYMENT,
			},
			async () => this._performPayment(senderId, amount),
		);
	}

	private async _validateRequest({ amount, cashierId, senderId }: PayDTO): Promise<void> {
		this._validateMinimumPayAmount(amount);
		this._ensureSenderIsNotSendingToThemselves(senderId, cashierId);
		await this._ensureSenderExist(senderId);
		await this._validateCashier(cashierId);
	}

	private _validateMinimumPayAmount(amount: number): void {
		if (amount < MINIMUM_PAY_AMOUNT) {
			throw new Error(`The amount to be sent must be at least ${MINIMUM_PAY_AMOUNT}`);
		}
	}

	private _ensureSenderIsNotSendingToThemselves(senderId: string, cashierId: string): void {
		if (senderId === cashierId) {
			throw new Error("You cannot send to yourself");
		}
	}

	private async _ensureSenderExist(senderId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId: senderId });
		if (!user) {
			throw new Error(`User ${senderId} does not exist`);
		}
	}

	private async _validateCashier(cashierId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId: cashierId });
		if (!user) {
			throw new Error(`User ${cashierId} does not exist`);
		}

		const hasPermission = await this._userRoleManagementService.hasPermission(
			user,
			USER_ACCOUNT_TYPE.CASHIER,
		);
		if (!hasPermission) {
			throw new Error(`User ${cashierId} does not have the required permission`);
		}
	}

	private async _performPayment(senderId: string, amount: number): Promise<IWallet> {
		const wallet = await this._getWalletByUserId(senderId);
		this._ensureSenderHaveEnoughMoney(senderId, wallet.balanceValue, amount);

		wallet.reduceBalance(amount);
		return await this._updateWallet(wallet);
	}

	private async _getWalletByUserId(userId: string): Promise<IWallet> {
		const wallet = await this._walletRepository.findWalletByUserId(userId);
		if (!wallet) {
			throw new Error(`User ${userId} wallet does not exist`);
		}

		return wallet;
	}

	private _ensureSenderHaveEnoughMoney(senderId: string, balance: number, amount: number): void {
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
}
