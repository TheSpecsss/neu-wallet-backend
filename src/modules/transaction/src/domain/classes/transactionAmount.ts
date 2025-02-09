import { Result } from "@/shared/core/result";

export interface ITransactionAmount {
	value: number;
}

export class TransactionAmount implements ITransactionAmount {
	private readonly _value: number;
	public static readonly MINIMUM_AMOUNT = 1;

	private constructor(value: number) {
		this._value = value;
	}

	public static create(amount: number): Result<TransactionAmount> {
		if (amount < TransactionAmount.MINIMUM_AMOUNT) {
			return Result.fail(
				`Invalid transaction amount. Amount must be at least ${TransactionAmount.MINIMUM_AMOUNT}.`,
			);
		}

		return Result.ok(new TransactionAmount(amount));
	}

	public get value(): number {
		return this._value;
	}
}
