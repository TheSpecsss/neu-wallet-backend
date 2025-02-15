import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { IUserRawObject } from "@/modules/user/src/domain/shared/constant";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

const assertUser = (value: IUser | null, expectedValue: IUserRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.nameValue).toBe(expectedValue.name);
	expect(value!.emailValue).toBe(expectedValue.email);
	expect(value!.password).toBe(expectedValue.password);
	expect(value!.accountTypeValue).toBe(expectedValue.accountType);
	expect(value!.isDeleted).toBe(expectedValue.isDeleted);
};

describe("Test User Repository findUsersByIds", () => {
	let userRepository: IUserRepository;

	beforeAll(async () => {
		userRepository = new UserRepository();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it("should retrieve a users by ids", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();

		const users = await userRepository.findUsersByIds([seededUserOne.id, seededUserTwo.id]);

		expect(users).toHaveLength(2);
		assertUser(users[0], seededUserOne);
		assertUser(users[1], seededUserTwo);
	});

	it("should only retrieve existing users", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserIdThree = "non-existing-user-id";

		const users = await userRepository.findUsersByIds([
			seededUserOne.id,
			seededUserTwo.id,
			seededUserIdThree,
		]);

		expect(users).toHaveLength(2);
		assertUser(users[0], seededUserOne);
		assertUser(users[1], seededUserTwo);
		expect(users[2]).toBeUndefined();
	});

	it("should retrieve deleted users when includeDeleted is true", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserThree = await seedUser({
			isDeleted: true,
			deletedAt: new Date(),
		});

		const users = await userRepository.findUsersByIds(
			[seededUserOne.id, seededUserTwo.id, seededUserThree.id],
			{ includeDeleted: true },
		);

		expect(users).toHaveLength(3);
		assertUser(users[0], seededUserOne);
		assertUser(users[1], seededUserTwo);
		assertUser(users[2], seededUserThree);
	});

	it("should not retrieve deleted users when includeDeleted is false", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserThree = await seedUser({
			isDeleted: true,
			deletedAt: new Date(),
		});

		const users = await userRepository.findUsersByIds(
			[seededUserOne.id, seededUserTwo.id, seededUserThree.id],
			{ includeDeleted: false },
		);

		expect(users).toHaveLength(2);
		assertUser(users[0], seededUserOne);
		assertUser(users[1], seededUserTwo);
		expect(users[2]).toBeUndefined();
	});

	it("should return empty array when given non-existing user id", async () => {
		const users = await userRepository.findUsersByIds(["non-existing-user-id"]);

		expect(users).toEqual([]);
	});
});
