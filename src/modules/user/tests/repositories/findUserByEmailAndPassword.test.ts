import { beforeAll, describe, expect, it } from "bun:test";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { IUserRawObject } from "@/modules/user/src/domain/shared/constant";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

const assertUser = (value: IUser | null, expectedValue: IUserRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.nameValue).toBe(expectedValue.name);
	expect(value!.emailValue).toBe(expectedValue.email);
	expect(value!.password).toBe(expectedValue.password);
	expect(value!.accountTypeValue).toBe(expectedValue.accountType);
	expect(value!.isDeleted).toBe(expectedValue.isDeleted);
};

describe("UserRepository findUserByEmailAndPassword", () => {
	let userRepository: IUserRepository;

	beforeAll(async () => {
		userRepository = new UserRepository();
	});

	it("should retrieve existing user found by email and password", async () => {
		const seededUser = await seedUser();

		const user = await userRepository.findUserByEmailAndPassword(
			seededUser.email,
			seededUser.password,
		);

		assertUser(user, seededUser);
	});

	it("should return null when given email does not exist", async () => {
		const seededUser = await seedUser();

		const user = await userRepository.findUserByEmailAndPassword(
			"seededUserEmail",
			seededUser.password,
		);

		expect(user).toBeNull();
	});

	it("should return null when given password does not exist", async () => {
		const seededUser = await seedUser();

		const user = await userRepository.findUserByEmailAndPassword(
			seededUser.email,
			"seededUserPassword",
		);

		expect(user).toBeNull();
	});
});
