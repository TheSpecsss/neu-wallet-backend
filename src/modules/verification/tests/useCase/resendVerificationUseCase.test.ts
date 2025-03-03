import { beforeAll, describe, expect, it } from "bun:test";
import { type IUserService, UserService } from "@/modules/user/src";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import { ResendVerificationUseCase } from "@/modules/verification/src/useCase/resendVerificationUseCase";
import { seedVerification } from "@/modules/verification/tests/utils/seedVerification";

describe("ResendVerificationUseCase", () => {
	let useCase: ResendVerificationUseCase;
	let userService: IUserService;

	beforeAll(async () => {
		useCase = new ResendVerificationUseCase();
		userService = new UserService();
	});

	it("should resent verification after the 2-minute cooldown period", async () => {
		const seededUser = await seedUser({ isVerified: false });
		const seededVerification = await seedVerification({
			userId: seededUser.id,
			status: VERIFICATION_STATUS.PENDING,
			updatedAt: new Date(Date.now() - 2 * 60 * 1000 + 1),
		});

		const verification = await useCase.execute({ email: seededUser.email });

		expect(verification.code).not.toBe(seededVerification.code);
		expect(verification.status).not.toBe(VERIFICATION_STATUS.PENDING);
		expect(verification.expiredAt.getTime()).not.toBe(seededVerification.expiredAt.getTime());
	});

	it("should throw an error when email does not exist", async () => {
		const email = "test-for-unexisting-email@neu.edu.ph";

		let errorMessage = "";
		try {
			await useCase.execute({ email });
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`${email} does not exist`);
	});

	it("should throw an error when user is already verified", async () => {
		const seededUser = await seedUser({ isVerified: true });
		await seedVerification({ userId: seededUser.id });

		let errorMessage = "";
		try {
			await useCase.execute({ email: seededUser.email });
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`${seededUser.email} has already been verified`);
	});

	it("should throw an error when user does not have a pending verification", async () => {
		const seededUser = await seedUser({ isVerified: false });

		let errorMessage = "";
		try {
			await useCase.execute({ email: seededUser.email });
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("User does not have any pending verification");
	});

	it("should throw an error when requesting a new verification within the 2-minute cooldown period", async () => {
		const seededUser = await seedUser({ isVerified: false });
		await seedVerification({
			userId: seededUser.id,
			status: VERIFICATION_STATUS.PENDING,
			updatedAt: new Date(Date.now() - 60 * 1000), // 1 minute lapse
		});

		let errorMessage = "";
		try {
			await useCase.execute({ email: seededUser.email });
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toContain("Verification resend is on cooldown.");
	});
});
