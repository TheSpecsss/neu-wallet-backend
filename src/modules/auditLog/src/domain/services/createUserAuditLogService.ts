import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogFactory, type IAuditLogFactory } from "@/modules/auditLog/src/domain/factory";
import type { IAuditLogChange } from "@/modules/auditLog/src/domain/shared/auditLogChanges";
import { ACTION_TYPE, type ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";
import type { CreateUserAuditLogServiceDTO } from "@/modules/auditLog/src/dtos/auditLogServiceDTO";
import { AuditLogRepository } from "@/modules/auditLog/src/repositories/auditLogRepository";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { IUserRawObject } from "@/modules/user/src/domain/shared/constant";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import { equals } from "rambda";

export class CreateUserAuditLogService {
	constructor(
		private _auditLogRepository = new AuditLogRepository(),
		private _userMapper = UserMapper,
	) {}

	public async execute(request: CreateUserAuditLogServiceDTO): Promise<IAuditLog> {
		const { executorId, newUser, oldUser, actionType } = request;

		this._validateUserIdentity(oldUser.idValue, newUser.idValue);

		const { oldUserPersistenceData, newUserPersistenceData } = this._mapUserToPersistenceData(
			oldUser,
			newUser,
		);

		const changes = this._constructAuditLogChanges(
			oldUserPersistenceData,
			newUserPersistenceData,
			actionType,
		);

		const auditLog = this._createAuditLog({
			executorId,
			targetId: oldUser.idValue,
			actionType,
			changes,
			createdAt: new Date(),
		});

		return await this._auditLogRepository.save(auditLog);
	}

	private _validateUserIdentity(oldUserId: string, newUserId: string): void {
		if (oldUserId !== newUserId) {
			throw new Error("The old and new userId does not match");
		}
	}

	private _mapUserToPersistenceData(
		oldUser: IUser,
		newUser: IUser,
	): {
		oldUserPersistenceData: IUserRawObject;
		newUserPersistenceData: IUserRawObject;
	} {
		const oldUserPersistenceData = this._userMapper.toPersistence(oldUser) as IUserRawObject;
		const newUserPersistenceData = this._userMapper.toPersistence(newUser) as IUserRawObject;

		return {
			oldUserPersistenceData,
			newUserPersistenceData,
		};
	}

	private _constructAuditLogChanges(
		oldUser: IUserRawObject,
		newUser: IUserRawObject,
		actionType: ActionTypeKind,
	): IAuditLogChange[] {
		if (actionType === ACTION_TYPE.USER_DELETE) {
			return [];
		}

		const changes: IAuditLogChange[] = [];
		for (const key of Object.keys(oldUser) as (keyof typeof oldUser)[]) {
			const oldValue = oldUser[key];
			const newValue = newUser[key];

			if (oldValue instanceof Date || newValue instanceof Date) continue;

			if (!equals(oldValue, newValue)) {
				changes.push({
					key,
					values: [
						{
							from: this._normalizeValue(oldValue),
							to: this._normalizeValue(newValue),
						},
					],
				});
			}
		}

		return changes;
	}

	private _normalizeValue(value: unknown): string {
		return value === null || value === undefined ? "" : String(value);
	}

	private _createAuditLog(props: IAuditLogFactory): IAuditLog {
		const auditLog = AuditLogFactory.create(props);
		if (auditLog.isFailure) {
			throw new Error(`Failed to create audit log: ${auditLog.getErrorMessage()}`);
		}

		return auditLog.getValue();
	}
}
