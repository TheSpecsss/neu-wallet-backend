import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionFactory } from "@/modules/transaction/src/domain/factory";
import type {
	ITransactionRawObject,
	ITransactionSchemaObject,
} from "@/modules/transaction/src/domain/shared/constant";

export class TransactionMapper {
	public static toDomain(rawData: ITransactionRawObject): ITransaction {
		const factory = TransactionFactory.create({
			...rawData,
			amount: rawData.amount.toNumber(),
		});

		return factory.getValue();
	}

	public static toPersistence(transaction: ITransaction): ITransactionSchemaObject {
		return {
			id: transaction.idValue,
			senderId: transaction.senderIdValue,
			receiverId: transaction.receiverIdValue,
			amount: transaction.amountValue,
			type: transaction.typeValue,
			createdAt: transaction.createdAt,
		};
	}
}
