import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { IUserRawObject } from "@/modules/user/src/domain/shared/constant";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { db } from "@/shared/infrastructure/database";

const assertUser = (value: IUser | null, expectedValue: IUserRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.nameValue).toBe(expectedValue.name);
	expect(value!.emailValue).toBe(expectedValue.email);
	expect(value!.password).toBe(expectedValue.password);
	expect(value!.accountTypeValue).toBe(expectedValue.accountType);
	expect(value!.isDeleted).toBe(expectedValue.isDeleted);
};

describe("Test User Repository findUserByEmailAndPassword", () => {
	let userRepository: IUserRepository;

	beforeAll(async () => {
		userRepository = new UserRepository();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it("should retrieve existing user found by email and password", async () => {
		const seededWallet = await seedWallet();
		const seededUser = await seedUser({ walletId: seededWallet.id });

		const user = await userRepository.findUserByEmailAndPassword(
			seededUser.email,
			seededUser.password,
		);

		assertUser(user, seededUser);
	});

	it("should return null when given email does not exist", async () => {
		const seededWallet = await seedWallet();
		const seededUser = await seedUser({ walletId: seededWallet.id });

		const user = await userRepository.findUserByEmailAndPassword(
			"seededUserEmail",
			seededUser.password,
		);

		expect(user).toBeNull();
	});

	it("should return null when given password does not exist", async () => {
		const seededWallet = await seedWallet();
		const seededUser = await seedUser({ walletId: seededWallet.id });

		const user = await userRepository.findUserByEmailAndPassword(
			seededUser.email,
			"seededUserPassword",
		);

		expect(user).toBeNull();
	});
});
