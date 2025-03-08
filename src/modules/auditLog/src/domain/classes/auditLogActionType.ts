import { ACTION_TYPE, type ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";
import { Result } from "@/shared/core/result";

export interface IAuditLogActionType {
	value: string;
}

export class AuditLogActionType implements IAuditLogActionType {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(type: string): Result<AuditLogActionType> {
		if (!Object.values(ACTION_TYPE).includes(type as ActionTypeKind)) {
			return Result.fail(`${type} is invalid audit log action type`);
		}

		return Result.ok(new AuditLogActionType(type));
	}

	public get value(): string {
		return this._value;
	}
}
