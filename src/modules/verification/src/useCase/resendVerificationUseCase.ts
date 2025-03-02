import { type IUserService, UserService } from "@/modules/user/src";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { IVerification } from "@/modules/verification/src/domain/classes/verification";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import type { IResendVerificationDTO } from "@/modules/verification/src/dtos/verificationDTO";
import {
	type IVerificationRepository,
	VerificationRepository,
} from "@/modules/verification/src/repositories/verificationRepository";
import { generateVerificationCode } from "@/shared/infrastructure/authentication/generateVerificationCode";
import { sendVerificationEmail } from "@/shared/infrastructure/smtp/helpers/sendVerificationEmail";

export class ResendVerificationUseCase {
	private _verificationRepository: IVerificationRepository;
	private _userService: IUserService;

	constructor(
		verificationRepository = new VerificationRepository(),
		userService = new UserService(),
	) {
		this._verificationRepository = verificationRepository;
		this._userService = userService;
	}

	public async execute(request: IResendVerificationDTO): Promise<IVerification> {
		const { email } = request;

		const user = await this._getUserByEmail(email);
		const verification = await this._getVerificationByUserId(user.idValue);

		verification.updateCode(generateVerificationCode());
		verification.updateStatus(VERIFICATION_STATUS.PENDING);
		verification.updateExpiration(new Date(Date.now() + 60 * 60 * 1000));

		const updatedVerification = await this._updateVerification(verification);

		sendVerificationEmail(email, updatedVerification.code);

		return updatedVerification;
	}

	private async _getUserByEmail(email: string): Promise<IUser> {
		const user = await this._userService.findUserByEmail({ email });
		if (!user) {
			throw new Error(`User ${email} does not exist`);
		}

		if (user.isVerified) {
			throw new Error(`User ${email} already been verified`);
		}

		return user;
	}

	private async _getVerificationByUserId(userId: string): Promise<IVerification> {
		const verification = await this._verificationRepository.findPendingVerificationByUserId(userId);
		if (!verification) {
			throw new Error("User does not have any pending verification");
		}

		const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
		if (verification.updatedAt.getTime() > twoMinutesAgo.getTime()) {
			throw new Error("Cannot resend verification within the last 2 minutes");
		}

		return verification;
	}

	private async _updateVerification(verification: IVerification): Promise<IVerification> {
		const updatedVerification = await this._verificationRepository.updateVerification(verification);
		if (!updatedVerification) {
			throw new Error("Something went wrong while updating user verification");
		}

		return updatedVerification;
	}
}
