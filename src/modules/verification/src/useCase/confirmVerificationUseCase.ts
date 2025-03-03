import { type IUserService, UserService } from "@/modules/user/src";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { IVerification } from "@/modules/verification/src/domain/classes/verification";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import type { IConfirmVerificationDTO } from "@/modules/verification/src/dtos/verificationDTO";
import {
	type IVerificationRepository,
	VerificationRepository,
} from "@/modules/verification/src/repositories/verificationRepository";

export class ConfirmVerificationUseCase {
	private _verificationRepository: IVerificationRepository;
	private _userService: IUserService;

	constructor(
		verificationRepository = new VerificationRepository(),
		userService = new UserService(),
	) {
		this._verificationRepository = verificationRepository;
		this._userService = userService;
	}

	public async execute(request: IConfirmVerificationDTO): Promise<IVerification> {
		const { email, code } = request;

		const user = await this._getUserByEmail(email);
		const verification = await this._getVerificationByUserIdAndCode(user.idValue, code);

		verification.updateStatus(VERIFICATION_STATUS.DONE);
		user.updateIsVerified(true);

		const updatedVerification = await this._updateVerification(verification);
		await this._updateUser(user);

		return updatedVerification;
	}

	private async _getUserByEmail(email: string): Promise<IUser> {
		const user = await this._userService.findUserByEmail({ email });
		if (!user) {
			throw new Error(`${email} does not exist`);
		}

		if (user.isVerified) {
			throw new Error(`${email} has already been verified`);
		}

		return user;
	}

	private async _getVerificationByUserIdAndCode(
		userId: string,
		code: string,
	): Promise<IVerification> {
		const verification = await this._verificationRepository.findVerificationByUserIdAndCode(
			userId,
			code,
		);
		if (!verification) {
			throw new Error("Verification code is invalid");
		}

		if (verification.expiredAt.getTime() < Date.now()) {
			throw new Error("Verification code has expired");
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

	private async _updateUser(user: IUser): Promise<void> {
		const updatedUser = await this._userService.updateUser(user);
		if (!updatedUser) {
			throw new Error("Something went wrong while updating user");
		}
	}
}
