import { beforeAll, describe, expect, it } from "bun:test";
import { type IUserService, UserService } from "@/modules/user/src";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import { ConfirmVerificationUseCase } from "@/modules/verification/src/useCase/confirmVerificationUseCase";
import { seedVerification } from "@/modules/verification/tests/utils/seedVerification";

describe("ConfirmVerificationUseCase", () => {
	let useCase: ConfirmVerificationUseCase;
	let userService: IUserService;

	beforeAll(async () => {
		useCase = new ConfirmVerificationUseCase();
		userService = new UserService();
	});

	it("should confirm user's verification", async () => {
		const seededUser = await seedUser({ isVerified: false });
		const seededVerification = await seedVerification({ userId: seededUser.id });

		const verification = await useCase.execute({
			email: seededUser.email,
			code: seededVerification.code,
		});
		expect(verification.statusValue).toBe(VERIFICATION_STATUS.DONE);

		const user = await userService.findUserById({ userId: seededUser.id });
		expect(user!.isVerified).toBe(true);
	});

	it("should throw an error when email does not exist", async () => {
		const email = "test-for-unexisting-email@neu.edu.ph";

		let errorMessage = "";
		try {
			await useCase.execute({
				email,
				code: "000000",
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`${email} does not exist`);
	});

	it("should throw an error when user is already verified", async () => {
		const seededUser = await seedUser({ isVerified: true });
		const seededVerification = await seedVerification({ userId: seededUser.id });

		let errorMessage = "";
		try {
			await useCase.execute({
				email: seededUser.email,
				code: seededVerification.code,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`${seededUser.email} has already been verified`);
	});

	it("should throw an error when user verification does not exist", async () => {
		const seededUser = await seedUser({ isVerified: false });

		let errorMessage = "";
		try {
			await useCase.execute({
				email: seededUser.email,
				code: "000000",
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("Verification code is invalid");
	});

	it("should throw an error when user verification is expired", async () => {
		const seededUser = await seedUser({ isVerified: false });
		const seededVerification = await seedVerification({
			userId: seededUser.id,
			expiredAt: new Date(),
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				email: seededUser.email,
				code: seededVerification.code,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("Verification code has expired");
	});
});
