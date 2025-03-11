import type { ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";
import type { IUser } from "@/modules/user/src/domain/classes/user";

export interface CreateUserAuditLogServiceDTO {
	executorId: string;
	oldUser: IUser;
	newUser: IUser;
	actionType: ActionTypeKind;
}
