import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogFactory } from "@/modules/auditLog/src/domain/factory";
import type { IAuditLogChange } from "@/modules/auditLog/src/domain/shared/auditLogChanges";
import type {
	IAuditLogRawObject,
	IAuditLogSchemaObject,
} from "@/modules/auditLog/src/domain/shared/constant";
import type { InputJsonArray } from "@prisma/client/runtime/client";

export class AuditLogMapper {
	public static toDomain(rawData: IAuditLogRawObject): IAuditLog {
		return AuditLogFactory.create({
			...rawData,
			changes: rawData.changes as unknown as IAuditLogChange[],
		}).getValue();
	}

	public static toPersistence(auditLog: IAuditLog): IAuditLogSchemaObject {
		return {
			id: auditLog.idValue,
			executorId: auditLog.executorIdValue,
			targetId: auditLog.targetIdValue,
			actionType: auditLog.actionTypeValue,
			changes: auditLog.changes as unknown as InputJsonArray[],
		};
	}
}
