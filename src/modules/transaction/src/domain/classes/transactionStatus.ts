import {
	TRANSACTION_STATUS,
	type TransactionStatusKind,
} from "@/modules/transaction/src/domain/shared/constant";
import { Result } from "@/shared/core/result";

export interface ITransactionStatus {
	value: string;
}

export class TransactionStatus implements ITransactionStatus {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(status: string): Result<TransactionStatus> {
		if (!Object.values(TRANSACTION_STATUS).includes(status as TransactionStatusKind)) {
			return Result.fail(`${status} is invalid transaction status`);
		}

		return Result.ok(new TransactionStatus(status));
	}

	public get value(): string {
		return this._value;
	}
}
