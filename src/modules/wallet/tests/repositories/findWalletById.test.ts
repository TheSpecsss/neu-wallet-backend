import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import type { IWalletRawObject } from "@/modules/wallet/src/domain/shared/constant";
import {
	type IWalletRepository,
	WalletRepository,
} from "@/modules/wallet/src/repositories/walletRepository";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { db } from "@/shared/infrastructure/database";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

const assertWallet = (value: IWallet | null, expectedValue: IWalletRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.balanceValue).toBe(expectedValue.balance.toNumber());
	expect(value!.isDeleted).toBe(expectedValue.isDeleted);
};

describe("Test Wallet Repository findWalletById", () => {
	let walletRepository: IWalletRepository;

	beforeAll(async () => {
		walletRepository = new WalletRepository();
	});

	afterAll(async () => {
		await db.$disconnect();
	});

	it("should retrieve existing wallet found by Id", async () => {
		const seededWallet = await seedWallet();

		const wallet = await walletRepository.findWalletById(seededWallet.id);

		assertWallet(wallet!, seededWallet);
	});

	it("should retrieve deleted wallet when includeDeleted is true", async () => {
		const seededWallet = await seedWallet({
			isDeleted: true,
			deletedAt: new Date(),
		});

		const wallet = await walletRepository.findWalletById(seededWallet.id, { includeDeleted: true });

		assertWallet(wallet!, seededWallet);
	});

  it("should hydrate user in the wallet", async () => {
		const seededWallet = await seedWallet();
		const seededUser = await seedUser({ walletId: seededWallet.id });

		const wallet = await walletRepository.findWalletById(
			seededWallet.id,
			{ includeDeleted: false },
			{ user: true },
		);

		assertWallet(wallet, seededWallet);
		expect(wallet!.user!.idValue).toBe(seededUser.id);
	});

	it("should return null when includeDeleted is false and wallet is deleted", async () => {
		const seededWallet = await seedWallet({
			isDeleted: true,
			deletedAt: new Date(),
		});

		const wallet = await walletRepository.findWalletById(seededWallet.id, {
			includeDeleted: false,
		});

		expect(wallet).toBeNull();
	});

	it("should return null when given non-existing wallet id", async () => {
		const user = await walletRepository.findWalletById("not-a-wallet-id");

		expect(user).toBeNull();
	});
});
