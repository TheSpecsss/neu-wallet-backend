import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";

describe("Test User Repository findUsersByPagination", () => {
	let userRepository: IUserRepository;

	beforeAll(() => {
		userRepository = new UserRepository();
	});

	beforeEach(async () => {
		await db.user.deleteMany();
	});

	it("should return users, limited by pagination size", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();
		const seededWalletThree = await seedWallet();

		const seededUserOne = await seedUser({ walletId: seededWalletOne.id });
		const seededUserTwo = await seedUser({ walletId: seededWalletTwo.id });
		const seededUserThree = await seedUser({ walletId: seededWalletThree.id });

		const result = await userRepository.findUsersByPagination({ start: 0, size: 2 });

		expect(result).toHaveLength(2);

		const userIds = result.map((user) => user.idValue);
		expect(userIds).toEqual([seededUserOne.id, seededUserTwo.id]);
		expect(userIds).not.toContain(seededUserThree.id);
	});

	it("should return with deleted users when includeDeleted is true, limited by pagination size", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();
		const seededWalletThree = await seedWallet();

		const seededUserOne = await seedUser({ walletId: seededWalletOne.id });
		const seededUserTwo = await seedUser({
			walletId: seededWalletTwo.id,
			isDeleted: true,
			deletedAt: new Date(),
		});
		const seededUserThree = await seedUser({ walletId: seededWalletThree.id });

		const result = await userRepository.findUsersByPagination(
			{ start: 0, size: 2 },
			{ includeDeleted: true },
		);

		const userIds = result.map((user) => user.idValue);
		expect(userIds).toEqual([seededUserOne.id, seededUserTwo.id]);
		expect(userIds).not.toContain(seededUserThree.id);
	});

	it("should not return deleted users, limited by pagination size", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();
		const seededWalletThree = await seedWallet();

		const seededUserOne = await seedUser({ walletId: seededWalletOne.id });
		const seededUserTwo = await seedUser({
			walletId: seededWalletTwo.id,
			isDeleted: true,
			deletedAt: new Date(),
		});
		const seededUserThree = await seedUser({ walletId: seededWalletThree.id });

		const result = await userRepository.findUsersByPagination(
			{ start: 0, size: 2 },
			{ includeDeleted: false },
		);

		const userIds = result.map((user) => user.idValue);
		expect(userIds).toEqual([seededUserOne.id, seededUserThree.id]);
		expect(userIds).not.toContain(seededUserTwo.id);
	});

	it("should return an empty list and pagination information when there's no user", async () => {
		const result = await userRepository.findUsersByPagination({
      start: 0, size: 10
    });

		expect(result).toEqual([]);
	});
});
