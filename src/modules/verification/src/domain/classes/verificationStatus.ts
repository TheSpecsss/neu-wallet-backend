import {
	VERIFICATION_STATUS,
	type VerificationStatusKind,
} from "@/modules/verification/src/domain/shared/constant";
import { Result } from "@/shared/core/result";

export interface IVerificationStatus {
	value: string;
}

export class VerificationStatus implements IVerificationStatus {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(status: string): Result<IVerificationStatus> {
		if (!Object.values(VERIFICATION_STATUS).includes(status as VerificationStatusKind)) {
			return Result.fail(`${status} is invalid status of user verification`);
		}

		return Result.ok(new VerificationStatus(status));
	}

	public get value(): string {
		return this._value;
	}
}
