import { describe, expect, it } from "bun:test";
import { Transaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionMapper } from "@/modules/transaction/src/mappers/transactionMapper";
import { createTransactionDomainObject } from "@/modules/transaction/tests/utils/createTransactionDomainObject";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";

describe("TransactionMapper", () => {
	it("should map to domain from persistence data", async () => {
		const userWallet = await seedWallet();
		const relatedUserWallet = await seedWallet();

		const user = await seedUser({ walletId: userWallet.id });
		const relatedUser = await seedUser({ walletId: relatedUserWallet.id });

		const schemaObject = await seedTransaction({ senderId: user.id, receiverId: relatedUser.id });
		const domainObject = TransactionMapper.toDomain(schemaObject);

		expect(domainObject).toBeInstanceOf(Transaction);
		expect(domainObject.idValue).toBe(schemaObject.id);
		expect(domainObject.senderIdValue).toBe(schemaObject.senderId);
		expect(domainObject.receiverIdValue).toBe(schemaObject.receiverId);
		expect(domainObject.amountValue).toBe(schemaObject.amount.toNumber());
		expect(domainObject.typeValue).toBe(schemaObject.type);
	});

	it("should map to persistence from domain", async () => {
		const domainObject = createTransactionDomainObject();
		const schemaObject = TransactionMapper.toPersistence(domainObject);

		expect(schemaObject.id).toBe(domainObject.idValue);
		expect(schemaObject.senderId).toBe(domainObject.senderIdValue);
		expect(schemaObject.receiverId).toBe(domainObject.receiverIdValue);
		expect(schemaObject.amount).toBe(domainObject.amountValue);
		expect(schemaObject.type).toBe(domainObject.typeValue);
	});
});
