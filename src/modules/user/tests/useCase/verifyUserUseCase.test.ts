import { beforeAll, describe, expect, it } from "bun:test";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";
import { VerifyUserUseCase } from "@/modules/user/src/useCase/verifyUserUseCase";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

describe("VerifyUserUseCase", () => {
	let useCase: VerifyUserUseCase;
	let userRepository: UserRepository;

	beforeAll(() => {
		useCase = new VerifyUserUseCase();
		userRepository = new UserRepository();
	});

	it("should verify the user", async () => {
		const seededUser = await seedUser({ isVerified: false });

		const result = await useCase.execute({ userId: seededUser.id });
		expect(result).toBeDefined();

		const user = await userRepository.findUserById(seededUser.id);
		expect(user!.isVerified).toBe(true);
	});

	it("should throw error if user does not exist", async () => {
		const userId = new SnowflakeID().toString();

		let errorMessage = "";
		try {
			await useCase.execute({ userId });
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${userId} does not exist`);
	});

	it("should throw error if user does exist but deleted", async () => {
		const seededUser = await seedUser({ isDeleted: true });

		let errorMessage = "";
		try {
			await useCase.execute({ userId: seededUser.id });
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededUser.id} does not exist`);
	});

	it("should throw error if user already been verified", async () => {
		const seededUser = await seedUser({ isVerified: true });

		let errorMessage = "";
		try {
			await useCase.execute({ userId: seededUser.id });
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededUser.id} already verified`);
	});
});
