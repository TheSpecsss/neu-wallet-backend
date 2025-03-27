import { beforeAll, describe, expect, it } from "bun:test";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { WalletBalance } from "@/modules/wallet/src/domain/classes/walletBalance";
import { WalletMapper } from "@/modules/wallet/src/mappers/walletMapper";
import {
	type IWalletRepository,
	WalletRepository,
} from "@/modules/wallet/src/repositories/walletRepository";
import { createWalletDomainObject } from "@/modules/wallet/tests/utils/createWalletDomainObject";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { Decimal } from "@/shared/domain/decimal";
import { faker } from "@faker-js/faker";

describe("WalletRepository updateMany", () => {
	let walletRepository: IWalletRepository;

	beforeAll(() => {
		walletRepository = new WalletRepository();
	});

	const generateRandomBalance = () => ({
		balance: new Decimal(
			faker.number.int({
				min: WalletBalance.MINIMUM_BALANCE_AMOUNT,
				max: Number.MAX_SAFE_INTEGER,
			}),
		),
	});

	it("should update many wallet properties", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserThree = await seedUser();

		const seededWalletOne = await seedWallet({ userId: seededUserOne.id });
		const seededWalletTwo = await seedWallet({ userId: seededUserTwo.id });
		const seededWalletThree = await seedWallet({ userId: seededUserThree.id });

		const walletOneNewData = generateRandomBalance();
		const walletTwoNewData = generateRandomBalance();
		const walletThreeNewData = generateRandomBalance();

		const walletOneDomainObject = WalletMapper.toDomain({
			...seededWalletOne,
			...walletOneNewData,
		});

		const walletTwoDomainObject = WalletMapper.toDomain({
			...seededWalletTwo,
			...walletTwoNewData,
		});

		const walletThreeDomainObject = WalletMapper.toDomain({
			...seededWalletThree,
			...walletThreeNewData,
		});

		const updatedWallets = await walletRepository.updateMany([
			walletOneDomainObject,
			walletTwoDomainObject,
			walletThreeDomainObject,
		]);
		expect(updatedWallets).toHaveLength(3);

		expect(updatedWallets[0].idValue).toBe(seededWalletOne.id);
		expect(updatedWallets[0].balanceValue).toBe(walletOneNewData.balance.toNumber());

		expect(updatedWallets[1].idValue).toBe(seededWalletTwo.id);
		expect(updatedWallets[1].balanceValue).toBe(walletTwoNewData.balance.toNumber());

		expect(updatedWallets[2].idValue).toBe(seededWalletThree.id);
		expect(updatedWallets[2].balanceValue).toBe(walletThreeNewData.balance.toNumber());
	});

	it("should return empty array when trying to update non-existing wallets", async () => {
		const seededUserOne = await seedUser();
		const seededUserTwo = await seedUser();
		const seededUserThree = await seedUser();

		const walletOneDomainObject = createWalletDomainObject({ userId: seededUserOne.id });
		const walletTwoDomainObject = createWalletDomainObject({ userId: seededUserTwo.id });
		const walletThreeDomainObject = createWalletDomainObject({ userId: seededUserThree.id });

		const updatedWallets = await walletRepository.updateMany([
			walletOneDomainObject,
			walletTwoDomainObject,
			walletThreeDomainObject,
		]);
		expect(updatedWallets).toHaveLength(0);
		expect(updatedWallets).toEqual([]);
	});
});
