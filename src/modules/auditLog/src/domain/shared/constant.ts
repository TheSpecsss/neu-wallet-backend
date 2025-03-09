import type { Prisma, UserAuditLog } from "@prisma/client";

export type IAuditLogRawObject = UserAuditLog;
export type IAuditLogSchemaObject = Prisma.UserAuditLogUncheckedCreateInput;

export const ACTION_TYPE = {
	USER_UPDATE: "USER_UPDATE",
	USER_DELETE: "USER_DELETE",
} as const;
export type ActionTypeKind = (typeof ACTION_TYPE)[keyof typeof ACTION_TYPE];
