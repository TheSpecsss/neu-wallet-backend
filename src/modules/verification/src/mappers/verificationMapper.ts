import type { IVerification } from "@/modules/verification/src/domain/classes/verification";
import { VerificationFactory } from "@/modules/verification/src/domain/factory";
import type {
	IVerificationRawObject,
	IVerificationSchemaObject,
} from "@/modules/verification/src/domain/shared/constant";

export class VerificationMapper {
	public static toDomain(rawData: IVerificationRawObject): IVerification {
		return VerificationFactory.create(rawData).getValue();
	}

	public static toPersistence(verification: IVerification): IVerificationSchemaObject {
		return {
			id: verification.idValue,
			userId: verification.userIdValue,
			code: verification.code,
			status: verification.statusValue,
			expiredAt: verification.expiredAt,
		};
	}
}
