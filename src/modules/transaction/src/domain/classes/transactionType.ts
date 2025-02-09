import {
	TRANSACTION_TYPE,
	type TransactionTypeKind,
} from "@/modules/transaction/src/domain/shared/constant";
import { Result } from "@/shared/core/result";

export interface ITransactionType {
	value: string;
}

export class TransactionType implements ITransactionType {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(type: string): Result<TransactionType> {
		if (!Object.values(TRANSACTION_TYPE).includes(type as TransactionTypeKind)) {
			return Result.fail(`${type} is invalid transaction type`);
		}

		return Result.ok(new TransactionType(type));
	}

	public get value(): string {
		return this._value;
	}
}
