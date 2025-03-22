import type { AuditLogDataKind } from "@/modules/auditLog/src/domain/services/createAuditLogService";
import type { ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";

export interface CreateAuditLogServiceDTO {
	executorId: string;
	oldData: AuditLogDataKind;
	newData: AuditLogDataKind;
	actionType: ActionTypeKind;
}
