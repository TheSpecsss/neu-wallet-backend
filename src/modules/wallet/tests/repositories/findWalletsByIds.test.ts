import { beforeAll, describe, expect, it } from "bun:test";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import type { IWalletRawObject } from "@/modules/wallet/src/domain/shared/constant";
import {
	type IWalletRepository,
	WalletRepository,
} from "@/modules/wallet/src/repositories/walletRepository";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";

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

	it("should retrieve a wallets by ids", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();

		const seededWalletOne = await seedWallet({ userId: seededUserOne.id });
		const seededWalletTwo = await seedWallet({ userId: seededUserTwo.id });

		const wallets = await walletRepository.findWalletsByIds([
			seededWalletOne.id,
			seededWalletTwo.id,
		]);

		expect(wallets).toHaveLength(2);
		assertWallet(wallets[0], seededWalletOne);
		assertWallet(wallets[1], seededWalletTwo);
	});

	it("should only retrieve existing wallets", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();

		const seededWalletOne = await seedWallet({ userId: seededUserOne.id });
		const seededWalletTwo = await seedWallet({ userId: seededUserTwo.id });
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
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserThree = await seedUser();

		const seededWalletOne = await seedWallet({ userId: seededUserOne.id });
		const seededWalletTwo = await seedWallet({ userId: seededUserTwo.id });
		const seededWalletThree = await seedWallet({
			userId: seededUserThree.id,
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
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserThree = await seedUser();

		const seededWalletOne = await seedWallet({ userId: seededUserOne.id });
		const seededWalletTwo = await seedWallet({ userId: seededUserTwo.id });
		const seededWalletThree = await seedWallet({
			userId: seededUserThree.id,
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
