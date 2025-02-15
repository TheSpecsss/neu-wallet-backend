import { describe, expect, it } from "bun:test";
import { Wallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletBalance } from "@/modules/wallet/src/domain/classes/walletBalance";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("Wallet", () => {
	const mockData = {
		id: new SnowflakeID(),
		userId: new SnowflakeID(),
		user: null,
		balance: WalletBalance.create(
			faker.number.float({ min: WalletBalance.MINIMUM_BALANCE_AMOUNT }),
		).getValue(),
		isDeleted: false,
		deletedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	it("should create a Wallet", () => {
		const wallet = Wallet.create(mockData);

		expect(wallet).toBeInstanceOf(Wallet);
		expect(wallet.id).toBe(mockData.id);
		expect(wallet.userId).toBe(mockData.userId);
		expect(wallet.user).toBe(mockData.user);
		expect(wallet.balance).toBe(mockData.balance);
		expect(wallet.isDeleted).toBe(mockData.isDeleted);
		expect(wallet.createdAt.toString()).toBe(mockData.createdAt.toString());
		expect(wallet.updatedAt.toString()).toBe(mockData.updatedAt.toString());
	});
});
