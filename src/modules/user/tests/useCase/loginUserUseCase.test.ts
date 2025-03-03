import { beforeAll, describe, expect, it } from "bun:test";
import { LoginUserUseCase } from "@/modules/user/src/useCase/loginUserUseCase";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { saltPassword } from "@/shared/infrastructure/authentication/saltPassword";

describe("LoginUserUseCase", () => {
	let useCase: LoginUserUseCase;

	beforeAll(() => {
		useCase = new LoginUserUseCase();
	});

	it("should login user", async () => {
		const password = "password";
		const saltedPassword = await saltPassword(password);

		const seededUser = await seedUser({ password: saltedPassword });

		const result = await useCase.execute({
			email: seededUser.email,
			password,
		});

		expect(result.token).toBeDefined();
	});

	it("should throw error if email does not exist", async () => {
		const email = "test-for-unexisting-email@neu.edu.ph";

		let errorMessage = "";
		try {
			await useCase.execute({
				email,
				password: "password123",
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`${email} does not exist`);
	});

	it("should throw error if email is valid but not verified", async () => {
		const password = "password";
		const saltedPassword = await saltPassword(password);

		const seededUser = await seedUser({ password: saltedPassword, isVerified: false });

		let errorMessage = "";
		try {
			await useCase.execute({
				email: seededUser.email,
				password,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`${seededUser.email} is not yet verified. Please verify your account`);
	});

	it("should throw error if password does not match", async () => {
		const password = "password";
		const saltedPassword = await saltPassword(password);

		const seededUser = await seedUser({ password: saltedPassword });

		let errorMessage = "";
		try {
			await useCase.execute({
				email: seededUser.email,
				password: "12345",
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("Incorrect password. Please try again");
	});
});
