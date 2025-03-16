import { beforeAll, describe, expect, it } from "bun:test";
import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TRANSACTION_TYPE } from "@/modules/transaction/src/domain/shared/constant";
import {
	type ITransactionRepository,
	TransactionRepository,
} from "@/modules/transaction/src/repositories/transactionRepository";
import { createTransactionDomainObject } from "@/modules/transaction/tests/utils/createTransactionDomainObject";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { Decimal } from "@/shared/domain/decimal";

const assertTransaction = (value: ITransaction, expectedValue: ITransaction) => {
	expect(value!.idValue).toBe(expectedValue.idValue);
	expect(value!.senderIdValue).toBe(expectedValue.senderIdValue);
	expect(value!.receiverIdValue).toBe(expectedValue.receiverIdValue);
	expect(value!.amount).toBe(expectedValue.amount);
	expect(value!.typeValue).toEqual(expectedValue.typeValue);
};

describe("Test Transaction Repository save", () => {
	let transactionRepository: ITransactionRepository;

	beforeAll(async () => {
		transactionRepository = new TransactionRepository();
	});

	it("should save transaction", async () => {
		const seededSender = await seedUser();
		const seededReceiver = await seedUser();

		const transactionDomainObject = createTransactionDomainObject({
			senderId: seededSender.id,
			receiverId: seededReceiver.id,
			amount: new Decimal(100),
			type: TRANSACTION_TYPE.PAYMENT,
		});

		const savedTransaction = await transactionRepository.save(transactionDomainObject);

		assertTransaction(savedTransaction, transactionDomainObject);
	});
});
