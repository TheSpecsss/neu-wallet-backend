import { beforeAll, describe, expect, it } from "bun:test";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { IUserRawObject } from "@/modules/user/src/domain/shared/constant";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";

const assertUser = (value: IUser | null, expectedValue: IUserRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.nameValue).toBe(expectedValue.name);
	expect(value!.emailValue).toBe(expectedValue.email);
	expect(value!.password).toBe(expectedValue.password);
	expect(value!.accountTypeValue).toBe(expectedValue.accountType);
	expect(value!.isDeleted).toBe(expectedValue.isDeleted);
};

describe("UserRepository findUserById", () => {
	let userRepository: IUserRepository;

	beforeAll(async () => {
		userRepository = new UserRepository();
	});

	it("should retrieve existing user found by Id", async () => {
		const seededUser = await seedUser();

		const user = await userRepository.findUserById(seededUser.id);

		assertUser(user, seededUser);
	});

	it("should retrieve deleted user when includeDeleted is true", async () => {
		const seededUser = await seedUser({
			isDeleted: true,
			deletedAt: new Date(),
		});

		const user = await userRepository.findUserById(seededUser.id, { includeDeleted: true });

		assertUser(user, seededUser);
	});

	it("should hydrate wallet in the users", async () => {
		const seededUser = await seedUser();
		const seededWallet = await seedWallet({ userId: seededUser.id });

		const user = await userRepository.findUserById(
			seededUser.id,
			{ includeDeleted: false },
			{ wallet: true },
		);

		assertUser(user, seededUser);
		expect(user!.wallet!.idValue).toBe(seededWallet.id);
	});

	it("should return null when includeDeleted is false and user is deleted", async () => {
		const seededUser = await seedUser({
			isDeleted: true,
			deletedAt: new Date(),
		});

		const user = await userRepository.findUserById(seededUser.id, { includeDeleted: false });

		expect(user).toBeNull();
	});

	it("should return null when given non-existing user id", async () => {
		const user = await userRepository.findUserById("not-a-user-id");

		expect(user).toBeNull();
	});
});
