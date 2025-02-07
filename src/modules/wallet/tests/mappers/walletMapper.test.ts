import { describe, expect, it } from "bun:test";
import { Wallet } from "@/modules/wallet/src/domain/classes/wallet";
import { WalletMapper } from "@/modules/wallet/src/mappers/walletMapper";
import { createWalletDomainObject } from "@/modules/wallet/tests/utils/createWalletDomainObject";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";

describe("WalletMapper", () => {
	it("should map to domain from persistence data", async () => {
		const walletSchemaObject = await seedWallet();
		const walletDomainObject = WalletMapper.toDomain(walletSchemaObject);

		expect(walletDomainObject).toBeInstanceOf(Wallet);
		expect(walletDomainObject.idValue).toBe(walletSchemaObject.id);
		expect(walletDomainObject.balanceValue).toBe(walletSchemaObject.balance.toNumber());
		expect(walletDomainObject.isDeleted).toBe(walletSchemaObject.isDeleted);
	});

	it("should map to persistence from domain", async () => {
		const walletDomainObject = createWalletDomainObject();
		const walletSchemaObject = WalletMapper.toPersistence(walletDomainObject);

		expect(walletSchemaObject.id).toBe(walletDomainObject.idValue);
		expect(walletSchemaObject.balance).toBe(walletDomainObject.balanceValue);
		expect(walletSchemaObject.isDeleted).toBe(walletDomainObject.isDeleted);
	});
});
