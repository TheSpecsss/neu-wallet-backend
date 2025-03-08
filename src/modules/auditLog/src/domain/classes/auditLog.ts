import type { IAuditLogActionType } from "@/modules/auditLog/src/domain/classes/auditLogActionType";
import type { IAuditLogChange } from "@/modules/auditLog/src/domain/shared/auditLogChanges";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { SnowflakeID } from "@/shared/domain/snowflakeId";

export interface IAuditLogData {
	id: SnowflakeID;
	executorId: SnowflakeID;
	executor: IUser | null;
	targetId: SnowflakeID;
	target: IUser | null;
	actionType: IAuditLogActionType;
	changes: IAuditLogChange[];
	createdAt: Date;
}

export interface IAuditLog extends IAuditLogData {
	idValue: string;
	executorIdValue: string;
	targetIdValue: string;
	actionTypeValue: string;
}

export class AuditLog implements IAuditLog {
	private readonly _id: SnowflakeID;
	private readonly _executorId: SnowflakeID;
	private readonly _executor: IUser | null;
	private readonly _targetId: SnowflakeID;
	private readonly _target: IUser | null;
	private readonly _actionType: IAuditLogActionType;
	private readonly _changes: IAuditLogChange[];
	private readonly _createdAt: Date;

	constructor(data: IAuditLogData) {
		this._id = data.id;
		this._executorId = data.executorId;
		this._executor = data.executor;
		this._targetId = data.targetId;
		this._target = data.target;
		this._actionType = data.actionType;
		this._changes = data.changes;
		this._createdAt = data.createdAt;
	}

	get id(): SnowflakeID {
		return this._id;
	}

	get idValue(): string {
		return this.id.toString();
	}

	get executorId(): SnowflakeID {
		return this._executorId;
	}

	get executorIdValue(): string {
		return this.executorId.toString();
	}

	get executor(): IUser | null {
		return this._executor;
	}

	get targetId(): SnowflakeID {
		return this._targetId;
	}

	get targetIdValue(): string {
		return this.targetId.toString();
	}

	get target(): IUser | null {
		return this._target;
	}

	get actionType(): IAuditLogActionType {
		return this._actionType;
	}

	get actionTypeValue(): string {
		return this.actionType.value;
	}

	get changes(): IAuditLogChange[] {
		return this._changes;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	public static create(props: IAuditLogData): IAuditLog {
		return new AuditLog(props);
	}
}
