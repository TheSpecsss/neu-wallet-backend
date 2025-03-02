import { beforeAll, describe, expect, it } from "bun:test";
import { UserName } from "@/modules/user/src/domain/classes/userName";
import { RegisterUserUseCase } from "@/modules/user/src/useCase/registerUserUseCase";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { faker } from "@faker-js/faker";

describe("RegisterUserUseCase", () => {
	let useCase: RegisterUserUseCase;

	beforeAll(() => {
		useCase = new RegisterUserUseCase();
	});

	it("should create a user with valid data", async () => {
		const variables = {
			email: faker.internet.email({ provider: "neu.edu.ph" }),
			name: faker.string.sample({
				min: UserName.MINIMUM_USERNAME_LENGTH,
				max: UserName.MAXIMUM_USERNAME_LENGTH,
			}),
			password: "12345",
			confirmPassword: "12345",
		};

		const result = await useCase.execute(variables);

		expect(result.id).toBeDefined();
		expect(result.emailValue).toBe(variables.email);
		expect(result.nameValue).toBe(variables.name);
		expect(result.password).not.toEqual(variables.password);
		expect(result.wallet!.userIdValue).toBe(result.idValue);
	});

	it("should throw error if password confirmation doesn't match", async () => {
		let errorMessage = "";
		try {
			await useCase.execute({
				email: "test@neu.edu.ph",
				name: "Test User",
				password: "password123",
				confirmPassword: "12345",
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("Password and confirm password do not match");
	});

	it("should throw error if email is invalid", async () => {
		let errorMessage = "";
		try {
			await useCase.execute({
				email: "invalid-email",
				name: "Test User",
				password: "password123",
				confirmPassword: "password123",
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			"Invalid email address. Please use a valid NEU email address (e.g., example@neu.edu.ph).",
		);
	});

	it("should throw error if email already exist but not verified", async () => {
		const seededUser = await seedUser({ isVerified: false });

		let errorMessage = "";
		try {
			await useCase.execute({
				email: seededUser.email,
				name: seededUser.name,
				password: seededUser.password,
				confirmPassword: seededUser.password,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			`User with an email ${seededUser.email} already exist but not verified. Please verify your account`,
		);
	});
});
