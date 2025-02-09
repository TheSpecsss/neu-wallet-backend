import type { Prisma, UserTransaction } from "@prisma/client";

export type ITransactionRawObject = UserTransaction;
export type ITransactionSchemaObject = Prisma.UserTransactionUncheckedCreateInput;

export const TRANSACTION_TYPE = {
	DEPOSIT: "DEPOSIT",
	WITHDRAW: "WITHDRAW",
	TRANSFER: "TRANSFER",
	PAYMENT: "PAYMENT",
} as const;
export type TransactionTypeKind = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
