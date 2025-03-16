import type { Prisma, UserWallet } from "@prisma/client";

export type IWalletRawObject = UserWallet;
export type IWalletSchemaObject = Prisma.UserWalletUncheckedCreateInput;

export const MINIMUM_PAY_AMOUNT = 1;