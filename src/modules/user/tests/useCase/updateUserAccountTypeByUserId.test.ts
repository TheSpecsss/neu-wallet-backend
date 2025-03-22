import { beforeAll, describe, expect, it } from "bun:test";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { UpdateUserAccountTypeByUserIdUseCase } from "@/modules/user/src/useCase/updateUserAccountTypeByUserId";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

describe("UpdateUserAccountTypeByUserId", () => {
	let useCase: UpdateUserAccountTypeByUserIdUseCase;
	let userRepository: IUserRepository;

	beforeAll(() => {
		useCase = new UpdateUserAccountTypeByUserIdUseCase();
		userRepository = new UserRepository();
	});

	it("should update user when target have higher position than target", async () => {
		const seededTarget = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededUpdater = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		const result = await useCase.execute({
			userId: seededTarget.id,
			updatedById: seededUpdater.id,
			accountType: USER_ACCOUNT_TYPE.CASHIER,
		});
		expect(result).toBeDefined();
		expect(result!.accountTypeValue).toBe(USER_ACCOUNT_TYPE.CASHIER);

		const updatedTarget = await userRepository.findUserById(result!.idValue);
		expect(updatedTarget!.accountTypeValue).toBe(USER_ACCOUNT_TYPE.CASHIER);
	});

	it("should throw an error when accountType is invalid type", async () => {
		const seededTarget = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededUpdater = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		const type = "invalid-account-type";

		let errorMessage = "";
		try {
			await useCase.execute({
				userId: seededTarget.id,
				updatedById: seededUpdater.id,
				accountType: type,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`${type} is invalid user account type`);
	});

	it("should throw an error when userId does not exist", async () => {
		const userId = new SnowflakeID().toString();
		const seededUpdater = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		let errorMessage = "";
		try {
			await useCase.execute({
				userId,
				updatedById: seededUpdater.id,
				accountType: USER_ACCOUNT_TYPE.CASH_TOP_UP,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(`User ${userId} does not exist`);
	});

	it("should throw an error when target have higher role than updater", async () => {
		const seededTarget = await seedUser({ accountType: USER_ACCOUNT_TYPE.SUPER_ADMIN });
		const seededUpdater = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		let errorMessage = "";
		try {
			await useCase.execute({
				userId: seededTarget.id,
				updatedById: seededUpdater.id,
				accountType: USER_ACCOUNT_TYPE.CASHIER,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("Modifying a user with a higher or equal role is restricted");
	});

	it("should throw an error when target have equal role than updater", async () => {
		const seededTarget = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
		const seededUpdater = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		let errorMessage = "";
		try {
			await useCase.execute({
				userId: seededTarget.id,
				updatedById: seededUpdater.id,
				accountType: USER_ACCOUNT_TYPE.CASHIER,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe("Modifying a user with a higher or equal role is restricted");
	});

	it("should throw an error when assigning a new role higher than updater's role", async () => {
		const seededTarget = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededUpdater = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		let errorMessage = "";
		try {
			await useCase.execute({
				userId: seededTarget.id,
				updatedById: seededUpdater.id,
				accountType: USER_ACCOUNT_TYPE.SUPER_ADMIN,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			"Assigning a role that is higher or equal to the current role is restricted",
		);
	});

	it("should throw an error when assigning a new role equal to the updater's role", async () => {
		const seededTarget = await seedUser({ accountType: USER_ACCOUNT_TYPE.USER });
		const seededUpdater = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });

		let errorMessage = "";
		try {
			await useCase.execute({
				userId: seededTarget.id,
				updatedById: seededUpdater.id,
				accountType: USER_ACCOUNT_TYPE.ADMIN,
			});
		} catch (error) {
			errorMessage = (error as Error).message;
		}

		expect(errorMessage).toBe(
			"Assigning a role that is higher or equal to the current role is restricted",
		);
	});
});
