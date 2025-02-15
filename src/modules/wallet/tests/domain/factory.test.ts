import { beforeEach, describe, expect, it } from "bun:test";
import { Wallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletBalance } from "@/modules/wallet/src/domain/classes/walletBalance";
import { type IWalletFactory, WalletFactory } from "@/modules/wallet/src/domain/factory";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("WalletFactory", () => {
	let mockData: IWalletFactory;

	beforeEach(() => {
		mockData = {
			id: new SnowflakeID().toString(),
			userId: new SnowflakeID().toString(),
			user: null,
			balance: faker.number.float({ min: WalletBalance.MINIMUM_BALANCE_AMOUNT }),
			isDeleted: false,
			deletedAt: null,
			createdAt: faker.date.past(),
			updatedAt: faker.date.past(),
		};
	});

	it("should successfully create a User when all properties are valid", () => {
		const result = WalletFactory.create(mockData);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(Wallet);

		const user = result.getValue();
		expect(user.idValue).toBe(mockData.id!);
		expect(user.userIdValue).toBe(mockData.userId);
		expect(user.balanceValue).toBe(mockData.balance);
		expect(user.isDeleted).toBe(mockData.isDeleted);
		expect(user.createdAt.toString()).toBe(mockData.createdAt.toString());
		expect(user.updatedAt.toString()).toBe(mockData.updatedAt.toString());
	});

	it("should fail if balance is less than the minimum value", () => {
		const invalidBalanceProps = {
			...mockData,
			balance: faker.number.float({
				min: Number.MIN_SAFE_INTEGER,
				max: WalletBalance.MINIMUM_BALANCE_AMOUNT - 1,
			}),
		};

		const result = WalletFactory.create(invalidBalanceProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`Invalid balance amount. Balance must be greater than or equal to ${WalletBalance.MINIMUM_BALANCE_AMOUNT}.`,
		);
	});
});
