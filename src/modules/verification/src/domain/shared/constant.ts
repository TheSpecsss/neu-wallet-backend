import type { Prisma, UserVerification } from "@prisma/client";

export type IVerificationRawObject = UserVerification;
export type IVerificationSchemaObject = Prisma.UserVerificationUncheckedCreateInput;

export const VERIFICATION_STATUS = {
	PENDING: "PENDING",
	EXPIRED: "EXPIRED",
	DONE: "DONE",
} as const;
export type VerificationStatusKind = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];
