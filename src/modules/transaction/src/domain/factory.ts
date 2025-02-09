import {
	type ITransaction,
	Transaction,
} from "@/modules/transaction/src/domain/classes/transaction";
import { TransactionAmount } from "@/modules/transaction/src/domain/classes/transactionAmount";
import { TransactionType } from "@/modules/transaction/src/domain/classes/transactionType";
import { type IUserFactory, UserFactory } from "@/modules/user/src/domain/factory";
import { Result } from "@/shared/core/result";
import { SnowflakeID } from "@/shared/domain/snowflakeId";

export interface ITransactionFactory {
	id?: string;
	senderId: string;
	sender?: IUserFactory | null;
	receiverId: string;
	receiver?: IUserFactory | null;
	amount: number;
	type: string;
	createdAt: Date;
}

export class TransactionFactory {
	public static create(props: ITransactionFactory): Result<ITransaction> {
		const transactionAmountOrError = TransactionAmount.create(props.amount);
		const transactionTypeOrError = TransactionType.create(props.type);

		const guardResult = Result.combine([transactionAmountOrError, transactionTypeOrError]);
		if (guardResult.isFailure) return guardResult as Result<ITransaction>;

		return Result.ok<ITransaction>(
			Transaction.create({
				...props,
				id: new SnowflakeID(props.id),
				senderId: new SnowflakeID(props.senderId),
				sender: props.sender ? UserFactory.create(props.sender).getValue() : null,
				receiverId: new SnowflakeID(props.receiverId),
				receiver: props.receiver ? UserFactory.create(props.receiver).getValue() : null,
				amount: transactionAmountOrError.getValue(),
				type: transactionTypeOrError.getValue(),
			}),
		);
	}
}
