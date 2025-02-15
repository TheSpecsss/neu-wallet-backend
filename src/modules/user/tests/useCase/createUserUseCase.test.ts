import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { UserName } from "@/modules/user/src/domain/classes/userName";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { CreateUserUseCase } from "@/modules/user/src/useCase/createUserUseCase";
import { db } from "@/shared/infrastructure/database";
import { faker } from "@faker-js/faker";

describe("CreateUserUseCase", () => {
	let createUserUseCase: CreateUserUseCase;

	beforeAll(() => {
		createUserUseCase = new CreateUserUseCase();
	});

	beforeEach(async () => {
		await db.userTransaction.deleteMany();
		await db.user.deleteMany();
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
			type: faker.helpers.arrayElement(Object.values(USER_ACCOUNT_TYPE)),
		};

		const result = await createUserUseCase.execute(variables);

		expect(result.id).toBeDefined();
		expect(result.emailValue).toBe(variables.email);
		expect(result.nameValue).toBe(variables.name);
		expect(result.password).not.toEqual(variables.password);
	});

	it("should throw error if password confirmation doesn't match", async () => {
		let errorMessage = "";
		try {
			await createUserUseCase.execute({
				email: "test@neu.edu.ph",
				name: "Test User",
				password: "password123",
				confirmPassword: "12345",
				type: USER_ACCOUNT_TYPE.USER,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("Password and confirm password do not match");
	});

	it("should throw error if email is invalid", async () => {
		let errorMessage = "";
		try {
			await createUserUseCase.execute({
				email: "invalid-email",
				name: "Test User",
				password: "password123",
				confirmPassword: "password123",
				type: "user",
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			"Invalid email address. Please use a valid NEU email address (e.g., example@neu.edu.ph).",
		);
	});
});
