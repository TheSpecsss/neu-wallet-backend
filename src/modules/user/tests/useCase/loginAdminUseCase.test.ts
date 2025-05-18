import { beforeAll, describe, expect, it } from "bun:test";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src";
import { LoginAdminUseCase } from "@/modules/user/src/useCase/loginAdminUseCase";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { saltPassword } from "@/shared/infrastructure/authentication/saltPassword";

describe("LoginAdminUseCase", () => {
	let useCase: LoginAdminUseCase;

	beforeAll(() => {
		useCase = new LoginAdminUseCase();
	});

	it("should login admin user", async () => {
		const password = "password";
		const saltedPassword = await saltPassword(password);

		const seededAdmin = await seedUser({
			accountType: USER_ACCOUNT_TYPE.ADMIN,
			password: saltedPassword,
		});

		const result = await useCase.execute({
			email: seededAdmin.email,
			password,
		});

		expect(result.token).toBeDefined();
	});

	it("should login super admin user", async () => {
		const password = "password";
		const saltedPassword = await saltPassword(password);

		const seededAdmin = await seedUser({
			accountType: USER_ACCOUNT_TYPE.SUPER_ADMIN,
			password: saltedPassword,
		});

		const result = await useCase.execute({
			email: seededAdmin.email,
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

		expect(errorMessage).toBe(
			`${seededUser.email} is not yet verified. Please verify your account`,
		);
	});

	it("should throw error if user are not admin", async () => {
		const password = "password";
		const saltedPassword = await saltPassword(password);

		const seededUser = await seedUser({
			accountType: USER_ACCOUNT_TYPE.USER,
			password: saltedPassword,
		});

		let errorMessage = "";
		try {
			await useCase.execute({
				email: seededUser.email,
				password: "12345",
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${seededUser.email} does not have admin permission`);
	});

	it("should throw error if password does not match", async () => {
		const password = "password";
		const saltedPassword = await saltPassword(password);

		const seededUser = await seedUser({
			password: saltedPassword,
			accountType: USER_ACCOUNT_TYPE.ADMIN,
		});

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
