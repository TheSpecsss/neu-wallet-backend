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

describe("WalletRepository update", () => {
	let walletRepository: IWalletRepository;

	beforeAll(() => {
		walletRepository = new WalletRepository();
	});

	it("should update wallet properties", async () => {
		const seededUser = await seedUser();
		const seededWallet = await seedWallet({ userId: seededUser.id });

		const newData = {
			balance: new Decimal(
				faker.number.int({
					min: WalletBalance.MINIMUM_BALANCE_AMOUNT,
					max: Number.MAX_SAFE_INTEGER,
				}),
			),
		};

		const walletDomainObject = WalletMapper.toDomain({ ...seededWallet, ...newData });

		const updatedWallet = await walletRepository.update(walletDomainObject);

		expect(updatedWallet!.idValue).toBe(seededWallet.id);
		expect(updatedWallet!.balanceValue).toBe(newData.balance.toNumber());
	});

	it("should return null when trying to update non-existing wallet", async () => {
		const seededUser = await seedUser();
		const walletDomainObject = createWalletDomainObject({ userId: seededUser.id });

		const wallet = await walletRepository.update(walletDomainObject);

		expect(wallet).toBeNull();
	});
});
