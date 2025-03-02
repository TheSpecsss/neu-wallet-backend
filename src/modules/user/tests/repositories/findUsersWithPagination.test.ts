import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { db } from "@/shared/infrastructure/database";

describe("UserRepository findUsersByPagination", () => {
	let userRepository: UserRepository;

	beforeAll(() => {
		userRepository = new UserRepository();
	});

	beforeEach(async () => {
		await db.userTransaction.deleteMany();
		await db.user.deleteMany();
	});

	it("should return users, limited by pagination size", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserThree = await seedUser();

		const result = await userRepository.findUsersByPagination({
			start: 0,
			size: 2,
		});

		expect(result).toHaveLength(2);

		const userIds = result.map((user) => user.idValue);
		expect(userIds).toEqual([seededUserOne.id, seededUserTwo.id]);
		expect(userIds).not.toContain(seededUserThree.id);
	});

	it("should return with delete users since includeDeleted is true, limited by pagination size", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser({
			isDeleted: true,
			deletedAt: new Date(),
		});
		const seededUserThree = await seedUser();

		const result = await userRepository.findUsersByPagination(
			{ start: 0, size: 2 },
			{ includeDeleted: true },
		);

		const userIds = result.map((user) => user.idValue);
		expect(userIds).toEqual([seededUserOne.id, seededUserTwo.id]);
		expect(userIds).not.toContain(seededUserThree.id);
	});

	it("should not return deleted users, limited by pagination size", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser({
			isDeleted: true,
			deletedAt: new Date(),
		});
		const seededUserThree = await seedUser();

		const result = await userRepository.findUsersByPagination({
			start: 0,
			size: 2,
		});

		const userIds = result.map((user) => user.idValue);
		expect(userIds).toEqual([seededUserOne.id, seededUserThree.id]);
		expect(userIds).not.toContain(seededUserTwo.id);
	});

	it("should return an empty list and pagination information when no users are seeded", async () => {
		const result = await userRepository.findUsersByPagination({
			start: 0,
			size: 1,
		});

		expect(result).toEqual([]);
	});
});
