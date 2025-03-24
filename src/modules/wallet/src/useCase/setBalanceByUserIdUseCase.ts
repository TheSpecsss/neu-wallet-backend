import { CreateAuditLogService } from "@/modules/auditLog/src/domain/services/createAuditLogService";
import { ACTION_TYPE } from "@/modules/auditLog/src/domain/shared/constant";
import { UserService } from "@/modules/user/src";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletFactory } from "@/modules/wallet/src/domain/factory";
import type { SetBalanceByUserIdDTO } from "@/modules/wallet/src/dtos/walletDTO";
import { WalletRepository } from "@/modules/wallet/src/repositories/walletRepository";

export class SetBalanceByUserIdUseCase {
	constructor(
		private _createAuditLogService = new CreateAuditLogService(),
		private _userService = new UserService(),
		private _userRoleManagementService = new UserRoleManagementService(),
		private _walletRepository = new WalletRepository(),
	) {}

	public async execute(dto: SetBalanceByUserIdDTO): Promise<IWallet> {
		const { userId, balance, executorId } = dto;

		await this._ensureExecutorIsAdmin(executorId);
		await this._ensureUserExist(userId);
		await this._ensureExecutorHasHigherPermission(executorId, userId);

		const wallet = await this._getWalletByUserId(userId);

		const oldWallet = this._cloneWallet(wallet);
		wallet.setBalance(balance);

		const updatedWallet = await this._walletRepository.update(wallet);

		await this._logAuditAction(executorId, oldWallet, updatedWallet);

		return updatedWallet;
	}

	private async _ensureExecutorIsAdmin(executorId: string): Promise<void> {
		const hasPermission = await this._userRoleManagementService.hasPermission(
			executorId,
			USER_ACCOUNT_TYPE.ADMIN,
		);
		if (!hasPermission) {
			throw new Error(`User ${executorId} does not have admin permission`);
		}
	}

	private async _ensureUserExist(userId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId });
		if (!user) {
			throw new Error(`User ${userId} does not exist`);
		}
	}

	private async _ensureExecutorHasHigherPermission(executorId: string, userId: string) {
		const hasHigherPermission = await this._userRoleManagementService.hasHigherPermission(
			executorId,
			userId,
		);
		if (!hasHigherPermission) {
			throw new Error(
				`Executor ${executorId} does not have enough permission to modify User ${userId}`,
			);
		}
	}

	private _cloneWallet(wallet: IWallet): IWallet {
		return WalletFactory.clone(wallet);
	}

	private async _getWalletByUserId(userId: string): Promise<IWallet> {
		const wallet = await this._walletRepository.findWalletByUserId(userId);
		if (!wallet) {
			throw new Error(`User ${userId} wallet does not exist`);
		}

		return wallet;
	}

	private async _logAuditAction(
		executorId: string,
		oldData: IWallet,
		newData: IWallet,
	): Promise<void> {
		await this._createAuditLogService.execute({
			actionType: ACTION_TYPE.WALLET_UPDATE,
			executorId,
			oldData,
			newData,
		});
	}
}
