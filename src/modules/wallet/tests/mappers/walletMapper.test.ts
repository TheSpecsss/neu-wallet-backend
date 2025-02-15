import { describe, expect, it } from "bun:test";
import { Wallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletMapper } from "@/modules/wallet/src/mappers/walletMapper";
import { createWalletDomainObject } from "@/modules/wallet/tests/utils/createWalletDomainObject";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

describe("WalletMapper", () => {
	it("should map to domain from persistence data", async () => {
		const seededUser = await seedUser();

		const walletSchemaObject = await seedWallet({ userId: seededUser.id });
		const walletDomainObject = WalletMapper.toDomain(walletSchemaObject);

		expect(walletDomainObject).toBeInstanceOf(Wallet);
		expect(walletDomainObject.idValue).toBe(walletSchemaObject.id);
		expect(walletDomainObject.userIdValue).toBe(walletSchemaObject.userId);
		expect(walletDomainObject.balanceValue).toBe(walletSchemaObject.balance.toNumber());
		expect(walletDomainObject.isDeleted).toBe(walletSchemaObject.isDeleted);
	});

	it("should map to persistence from domain", async () => {
		const walletDomainObject = createWalletDomainObject();
		const walletSchemaObject = WalletMapper.toPersistence(walletDomainObject);

		expect(walletSchemaObject.id).toBe(walletDomainObject.idValue);
		expect(walletSchemaObject.userId).toBe(walletDomainObject.userIdValue);
		expect(walletSchemaObject.balance).toBe(walletDomainObject.balanceValue);
		expect(walletSchemaObject.isDeleted).toBe(walletDomainObject.isDeleted);
	});
});
