import { CreateUserAuditLogService } from "@/modules/auditLog/src/domain/services/createUserAuditLogService";
import { ACTION_TYPE } from "@/modules/auditLog/src/domain/shared/constant";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import type { UpdateUserAccountTypeByUserIdDTO } from "@/modules/user/src/dtos/userDTO";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";

export class UpdateUserAccountTypeByUserIdUseCase {
	constructor(
		private _userRepository = new UserRepository(),
		private _userRoleManagementService = new UserRoleManagementService(),
		private _createUserAuditLogService = new CreateUserAuditLogService(),
	) {}

	public async execute(request: UpdateUserAccountTypeByUserIdDTO): Promise<IUser | null> {
		const { userId, accountType, updatedById } = request;

		const updater = await this._getUserById(updatedById);
		const target = await this._getUserById(userId);

		this._userRoleManagementService.ensureValidRoleChange(updater.accountTypeValue, {
			oldRole: target.accountTypeValue,
			newRole: accountType,
		});

		target.updateAccountType(accountType);

		const updatedUser = await this._updateUser(target);

		await this._logAuditAction(updatedById, target, updatedUser);

		return updatedUser;
	}

	private async _getUserById(userId: string): Promise<IUser> {
		const user = await this._userRepository.findUserById(userId);
		if (!user) {
			throw new Error(`User ${userId} does not exist`);
		}

		return user;
	}

	private async _updateUser(user: IUser): Promise<IUser> {
		const updatedUser = await this._userRepository.updateUser(user);
		if (!updatedUser) {
			throw new Error("Something went wrong while updating user");
		}

		return updatedUser;
	}

	private async _logAuditAction(executorId: string, oldUser: IUser, newUser: IUser): Promise<void> {
		await this._createUserAuditLogService.execute({
			actionType: ACTION_TYPE.USER_UPDATE,
			executorId,
			oldUser,
			newUser,
		});
	}
}
