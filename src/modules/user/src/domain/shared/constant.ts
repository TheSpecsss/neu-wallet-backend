import type { Prisma, User } from "@prisma/client";

export type IUserRawObject = User;
export type IUserSchemaObject = Prisma.UserUncheckedCreateInput;

export const USER_ACCOUNT_TYPE = {
	USER: "USER",
	CASHIER: "CASHIER",
	CASH_TOP_UP: "CASH_TOP_UP",
	ADMIN: "ADMIN",
	SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type UserAccountTypeKind = (typeof USER_ACCOUNT_TYPE)[keyof typeof USER_ACCOUNT_TYPE];
