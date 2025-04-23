import { describe, expect, it } from "bun:test";
import { Transaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionMapper } from "@/modules/transaction/src/mappers/transactionMapper";
import { createTransactionDomainObject } from "@/modules/transaction/tests/utils/createTransactionDomainObject";
import { seedTransaction } from "@/modules/transaction/tests/utils/seedTransaction";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

describe("TransactionMapper", () => {
	it("should map to domain from persistence data", async () => {
		const user = await seedUser();
		const relatedUser = await seedUser();

		const schemaObject = await seedTransaction({ senderId: user.id, receiverId: relatedUser.id });
		const domainObject = TransactionMapper.toDomain(schemaObject);

		expect(domainObject).toBeInstanceOf(Transaction);
		expect(domainObject.idValue).toBe(schemaObject.id);
		expect(domainObject.senderIdValue).toBe(schemaObject.senderId);
		expect(domainObject.receiverIdValue).toBe(schemaObject.receiverId);
		expect(domainObject.amount).toBe(schemaObject.amount.toNumber());
		expect(domainObject.typeValue).toBe(schemaObject.type);
		expect(domainObject.statusValue).toBe(schemaObject.status);
	});

	it("should map to persistence from domain", async () => {
		const domainObject = createTransactionDomainObject();
		const schemaObject = TransactionMapper.toPersistence(domainObject);

		expect(schemaObject.id).toBe(domainObject.idValue);
		expect(schemaObject.senderId).toBe(domainObject.senderIdValue);
		expect(schemaObject.receiverId).toBe(domainObject.receiverIdValue);
		expect(schemaObject.amount).toBe(domainObject.amount);
		expect(schemaObject.type).toBe(domainObject.typeValue);
		expect(schemaObject.status).toBe(domainObject.statusValue);
	});
});
