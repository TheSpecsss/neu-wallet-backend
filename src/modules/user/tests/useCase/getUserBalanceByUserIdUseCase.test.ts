import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { GetUserBalanceByUserIdUseCase } from "@/modules/user/src/useCase/getUserBalanceByUserIdUseCase";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { db } from "@/shared/infrastructure/database";

describe("GetUserBalanceByUserIdUseCase", () => {
	let getUserBalanceByUserIdUseCase: GetUserBalanceByUserIdUseCase;

	beforeAll(() => {
		getUserBalanceByUserIdUseCase = new GetUserBalanceByUserIdUseCase();
	});

	beforeEach(async () => {
		await db.userTransaction.deleteMany();
		await db.user.deleteMany();
	});

	it("should retrieve user's balance when user does exist", async () => {
		const seededUser = await seedUser();
		const seededWallet = await seedWallet({ userId: seededUser.id });

		const result = await getUserBalanceByUserIdUseCase.execute(seededUser.id);

		expect(Number(result.balance)).toBeCloseTo(seededWallet.balance.toNumber());
	});

	it("should throw an error when userId does not exist", async () => {
		const userId = new SnowflakeID();

		let errorMessage = "";
		try {
			await getUserBalanceByUserIdUseCase.execute(userId.toString());
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User with userId ${userId.toString()} cannot be found`);
	});

	it("should throw an error when user's wallet does not exist", async () => {
		const seededUser = await seedUser();

		let errorMessage = "";
		try {
			await getUserBalanceByUserIdUseCase.execute(seededUser.id);
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			`User ${seededUser.id} does not have a wallet. Please contact an admin`,
		);
	});
});
