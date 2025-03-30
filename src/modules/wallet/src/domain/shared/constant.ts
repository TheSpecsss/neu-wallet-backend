import type { Prisma, UserWallet } from "@prisma/client";

export type IWalletRawObject = UserWallet;
export type IWalletSchemaObject =
	| Prisma.UserWalletUncheckedCreateInput
	| Prisma.UserWalletUncheckedUpdateInput
	| Prisma.UserWalletUncheckedUpdateManyInput;

export const MINIMUM_PAY_AMOUNT = 1;
export const MINIMUM_TOPUP_AMOUNT = 1;
export const MINIMUM_TRANSFER_AMOUNT = 1;
export const MINIMUM_WITHDRAW_AMOUNT = 1;
