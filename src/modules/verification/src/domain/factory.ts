import { type IUserFactory, UserFactory } from "@/modules/user/src/domain/factory";
import {
	type IVerification,
	Verification,
} from "@/modules/verification/src/domain/classes/verification";
import { VerificationStatus } from "@/modules/verification/src/domain/classes/verificationStatus";
import { Result } from "@/shared/core/result";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

export interface IVerificationFactory {
	id?: string;
	userId: string;
	code: string;
	status: string;
	expiredAt: Date;
	createdAt: Date;
	updatedAt: Date;
	user?: IUserFactory | null;
}

export class VerificationFactory {
	public static create(props: IVerificationFactory): Result<IVerification> {
		const statusOrError = VerificationStatus.create(props.status);

		const guardResult = Result.combine([statusOrError]);
		if (guardResult.isFailure) return guardResult as Result<IVerification>;

		return Result.ok<IVerification>(
			Verification.create({
				...props,
				id: new SnowflakeID(props.id),
				userId: new SnowflakeID(props.userId),
				status: statusOrError.getValue(),
				user: props.user ? UserFactory.create(props.user).getValue() : null,
			}),
		);
	}
}
