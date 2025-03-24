import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogFactory, type IAuditLogFactory } from "@/modules/auditLog/src/domain/factory";
import type { IAuditLogChange } from "@/modules/auditLog/src/domain/shared/auditLogChanges";
import { ACTION_TYPE, type ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";
import type { CreateAuditLogServiceDTO } from "@/modules/auditLog/src/dtos/auditLogServiceDTO";
import { AuditLogRepository } from "@/modules/auditLog/src/repositories/auditLogRepository";
import { type IUser, User } from "@/modules/user/src/domain/classes/user";
import type { IUserRawObject } from "@/modules/user/src/domain/shared/constant";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import { type IWallet, Wallet } from "@/modules/wallet/src/domain/classes/wallet";
import type { IWalletRawObject } from "@/modules/wallet/src/domain/shared/constant";
import { WalletMapper } from "@/modules/wallet/src/mappers/walletMapper";
import { equals } from "rambda";

export type AuditLogDataKind = IUser | IWallet;
export type AuditLogDataRawObjectKind = IUserRawObject | IWalletRawObject;

export class CreateAuditLogService {
	constructor(
		private _auditLogRepository = new AuditLogRepository(),
		private _userMapper = UserMapper,
		private _walletMapper = WalletMapper,
	) {}

	public async execute(request: CreateAuditLogServiceDTO): Promise<IAuditLog> {
		const { executorId, oldData, newData, actionType } = request;

		this._validateMatchingIds(oldData.idValue, newData.idValue);

		const { oldPersistenceData, newPersistenceData } = this._mapToPersistenceData(oldData, newData);

		const changes = this._constructAuditLogChanges(
			oldPersistenceData,
			newPersistenceData,
			actionType,
		);

		const auditLog = this._createAuditLog({
			executorId,
			targetId: this._getTargetIdByOldData(oldData),
			actionType,
			changes,
			createdAt: new Date(),
		});

		return await this._auditLogRepository.save(auditLog);
	}

	private _validateMatchingIds(oldId: string, newId: string): void {
		if (oldId !== newId) {
			throw new Error("The old and new ID does not match");
		}
	}

	private _mapToPersistenceData(
		oldData: AuditLogDataKind,
		newData: AuditLogDataKind,
	): {
		oldPersistenceData: AuditLogDataRawObjectKind;
		newPersistenceData: AuditLogDataRawObjectKind;
	} {
		if (oldData instanceof User && newData instanceof User) {
			return {
				oldPersistenceData: this._userMapper.toPersistence(oldData) as IUserRawObject,
				newPersistenceData: this._userMapper.toPersistence(newData) as IUserRawObject,
			};
		}

		if (oldData instanceof Wallet && newData instanceof Wallet) {
			return {
				oldPersistenceData: this._walletMapper.toPersistence(oldData) as IWalletRawObject,
				newPersistenceData: this._walletMapper.toPersistence(newData) as IWalletRawObject,
			};
		}

		throw new Error("Invalid data kind or mismatched instances for oldData and newData");
	}

	private _constructAuditLogChanges(
		oldPersistenceData: AuditLogDataRawObjectKind,
		newPersistenceData: AuditLogDataRawObjectKind,
		actionType: ActionTypeKind,
	): IAuditLogChange[] {
		if (actionType === ACTION_TYPE.USER_DELETE) {
			return [];
		}

		const changes: IAuditLogChange[] = [];
		for (const key of Object.keys(oldPersistenceData) as (keyof typeof oldPersistenceData)[]) {
			const oldValue = oldPersistenceData[key];
			const newValue = newPersistenceData[key];

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

	private _getTargetIdByOldData(oldData: AuditLogDataKind): string {
		if (oldData instanceof Wallet) {
			return oldData.userIdValue;
		}

		if (oldData instanceof User) {
			return oldData.idValue;
		}

		throw new Error(`Unsupported data type: ${oldData.constructor.name}`);
	}

	private _createAuditLog(props: IAuditLogFactory): IAuditLog {
		const auditLog = AuditLogFactory.create(props);
		if (auditLog.isFailure) {
			throw new Error(auditLog.getErrorMessage() ?? "Failed to create audit log");
		}

		return auditLog.getValue();
	}
}
