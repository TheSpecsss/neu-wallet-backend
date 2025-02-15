import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { createUserDomainObject } from "@/modules/user/tests/utils/createUserDomainObject";
import { db } from "@/shared/infrastructure/database";

const assertUser = (value: IUser | null, expectedValue: IUser) => {
	expect(value!.idValue).toBe(expectedValue.idValue);
	expect(value!.nameValue).toBe(expectedValue.nameValue);
	expect(value!.emailValue).toBe(expectedValue.emailValue);
	expect(value!.password).toBe(expectedValue.password);
	expect(value!.accountTypeValue).toBe(expectedValue.accountTypeValue);
	expect(value!.isDeleted).toBe(expectedValue.isDeleted);
};

describe("Test User Repository createUser", () => {
	let userRepository: IUserRepository;

	beforeAll(async () => {
		userRepository = new UserRepository();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it("should create new user record", async () => {
		const userDomainObject = createUserDomainObject();

		await userRepository.createUser(userDomainObject);

		const user = await userRepository.findUserById(userDomainObject.idValue);

		assertUser(user, userDomainObject);
	});

	it("should not create an existing user", async () => {
		const userDomainObject = createUserDomainObject();

		await userRepository.createUser(userDomainObject);

		const user = await userRepository.findUserById(userDomainObject.idValue);

		assertUser(user, userDomainObject);

		let errorMessage = "";
		try {
			await userRepository.createUser(userDomainObject);
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("Unique constraint failed on the fields: (`id`)");
	});
});
