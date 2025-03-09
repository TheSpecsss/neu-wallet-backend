import { AuditLog, type IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogActionType } from "@/modules/auditLog/src/domain/classes/auditLogActionType";
import type { IAuditLogChange } from "@/modules/auditLog/src/domain/shared/auditLogChanges";
import { type IUserFactory, UserFactory } from "@/modules/user/src/domain/factory";
import { Result } from "@/shared/core/result";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

export interface IAuditLogFactory {
	id?: string;
	executorId: string;
	executor?: IUserFactory | null;
	targetId: string;
	target?: IUserFactory | null;
	actionType: string;
	changes: IAuditLogChange[];
	createdAt: Date;
}

export class AuditLogFactory {
	public static create(props: IAuditLogFactory): Result<IAuditLog> {
		const actionTypeOrError = AuditLogActionType.create(props.actionType);

		const guardResult = Result.combine([actionTypeOrError]);
		if (guardResult.isFailure) return guardResult as Result<IAuditLog>;

		return Result.ok<IAuditLog>(
			AuditLog.create({
				...props,
				id: new SnowflakeID(props.id),
				executorId: new SnowflakeID(props.executorId),
				executor: props.executor ? UserFactory.create(props.executor).getValue() : null,
				targetId: new SnowflakeID(props.targetId),
				target: props.target ? UserFactory.create(props.target).getValue() : null,
				actionType: actionTypeOrError.getValue(),
			}),
		);
	}
}
