import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import type { IWalletRawObject } from "@/modules/wallet/src/domain/shared/constant";
import {
	type IWalletRepository,
	WalletRepository,
} from "@/modules/wallet/src/repositories/walletRepository";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { db } from "@/shared/infrastructure/database";

const assertWallet = (value: IWallet | null, expectedValue: IWalletRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.balanceValue).toBe(expectedValue.balance.toNumber());
	expect(value!.isDeleted).toBe(expectedValue.isDeleted);
};

describe("Test Wallet Repository findWalletsByIds", () => {
	let walletRepository: IWalletRepository;

	beforeAll(async () => {
		walletRepository = new WalletRepository();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it("should retrieve a wallets by ids", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();

		const wallets = await walletRepository.findWalletsByIds([
			seededWalletOne.id,
			seededWalletTwo.id,
		]);

		expect(wallets).toHaveLength(2);
		assertWallet(wallets[0], seededWalletOne);
		assertWallet(wallets[1], seededWalletTwo);
	});

	it("should only retrieve existing wallets", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();
		const seededWalletIdThree = "non-existing-wallet-id";

		const wallets = await walletRepository.findWalletsByIds([
			seededWalletOne.id,
			seededWalletTwo.id,
			seededWalletIdThree,
		]);

		expect(wallets).toHaveLength(2);
		assertWallet(wallets[0], seededWalletOne);
		assertWallet(wallets[1], seededWalletTwo);
		expect(wallets[2]).toBeUndefined();
	});

	it("should retrieve deleted wallets when includeDeleted is true", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();
		const seededWalletThree = await seedWallet({
			isDeleted: true,
			deletedAt: new Date(),
		});

		const wallets = await walletRepository.findWalletsByIds(
			[seededWalletOne.id, seededWalletTwo.id, seededWalletThree.id],
			{ includeDeleted: true },
		);

		expect(wallets).toHaveLength(3);
		assertWallet(wallets[0], seededWalletOne);
		assertWallet(wallets[1], seededWalletTwo);
		assertWallet(wallets[2], seededWalletThree);
	});

	it("should not retrieve deleted users when includeDeleted is false", async () => {
		const seededWalletOne = await seedWallet();
		const seededWalletTwo = await seedWallet();
		const seededWalletThree = await seedWallet({
			isDeleted: true,
			deletedAt: new Date(),
		});

		const wallets = await walletRepository.findWalletsByIds(
			[seededWalletOne.id, seededWalletTwo.id, seededWalletThree.id],
			{ includeDeleted: false },
		);

		expect(wallets).toHaveLength(2);
		assertWallet(wallets[0], seededWalletOne);
		assertWallet(wallets[1], seededWalletTwo);
		expect(wallets[2]).toBeUndefined();
	});

	it("should return empty array when given non-existing wallet id", async () => {
		const wallets = await walletRepository.findWalletsByIds(["non-existing-wallet-id"]);

		expect(wallets).toEqual([]);
	});
});
