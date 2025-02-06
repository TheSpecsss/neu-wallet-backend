import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { IUserRawObject } from "@/modules/user/src/domain/shared/constant";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { db } from "@/shared/infrastructure/database";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

const assertUser = (user: IUser, expectedUserValue: IUserRawObject) => {
	expect(user!.idValue).toBe(expectedUserValue.id);
	expect(user!.nameValue).toBe(expectedUserValue.name);
	expect(user!.emailValue).toBe(expectedUserValue.email);
	expect(user!.password).toBe(expectedUserValue.password);
	expect(user!.accountTypeValue).toBe(expectedUserValue.accountType);
	expect(user!.isDeleted).toBe(expectedUserValue.isDeleted);
};

describe("Test User Repository findUserById", () => {
	let userRepository: IUserRepository;

	beforeAll(async () => {
		userRepository = new UserRepository();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it("should retrieve existing user found by Id", async () => {
		const seededUser = await seedUser();

		const user = await userRepository.findUserById(seededUser.id);

		assertUser(user!, seededUser);
	});

  it("should retrieve deleted user when includeDeleted is true", async () => {
		const seededUser = await seedUser({ isDeleted: true, deletedAt: new Date() });

		const user = await userRepository.findUserById(seededUser.id, { includeDeleted: true });

		assertUser(user!, seededUser);
	});

	it("should return null when includeDeleted is false and user is deleted", async () => {
		const seededUser = await seedUser({ isDeleted: true, deletedAt: new Date() });

		const user = await userRepository.findUserById(seededUser.id, { includeDeleted: false });

		expect(user).toBeNull();
	});

	it("should return null when given non-existing user id", async () => {
		const user = await userRepository.findUserById("not-a-user-id");

		expect(user).toBeNull();
	});
});
