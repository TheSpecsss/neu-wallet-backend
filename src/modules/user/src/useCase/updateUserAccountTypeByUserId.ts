import { CreateAuditLogService } from "@/modules/auditLog/src/domain/services/createAuditLogService";
import { ACTION_TYPE } from "@/modules/auditLog/src/domain/shared/constant";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserFactory } from "@/modules/user/src/domain/factory";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import type { UpdateUserAccountTypeByUserIdDTO } from "@/modules/user/src/dtos/userDTO";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";

export class UpdateUserAccountTypeByUserIdUseCase {
	constructor(
		private _userRepository = new UserRepository(),
		private _userRoleManagementService = new UserRoleManagementService(),
		private _createAuditLogService = new CreateAuditLogService(),
	) {}

	public async execute(request: UpdateUserAccountTypeByUserIdDTO): Promise<IUser | null> {
		const { userId, accountType, updatedById } = request;

		const updater = await this._getUserById(updatedById);
		const target = await this._getUserById(userId);

		this._userRoleManagementService.ensureValidRoleChange(updater.accountTypeValue, {
			oldRole: target.accountTypeValue,
			newRole: accountType,
		});

		const oldTarget = this._cloneTarget(target);
		target.updateAccountType(accountType);

		const updatedUser = await this._updateUser(target);

		await this._logAuditAction(updatedById, oldTarget, updatedUser);

		return updatedUser;
	}

	private async _getUserById(userId: string): Promise<IUser> {
		const user = await this._userRepository.findUserById(userId);
		if (!user) {
			throw new Error(`User ${userId} does not exist`);
		}

		return user;
	}

	private _cloneTarget(user: IUser): IUser {
		return UserFactory.clone(user);
	}

	private async _updateUser(user: IUser): Promise<IUser> {
		const updatedUser = await this._userRepository.updateUser(user);
		if (!updatedUser) {
			throw new Error("Something went wrong while updating user");
		}

		return updatedUser;
	}

	private async _logAuditAction(executorId: string, oldData: IUser, newData: IUser): Promise<void> {
		await this._createAuditLogService.execute({
			actionType: ACTION_TYPE.USER_UPDATE,
			executorId,
			oldData,
			newData,
		});
	}
}
