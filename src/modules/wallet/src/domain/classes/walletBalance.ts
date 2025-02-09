import { Result } from "@/shared/core/result";

export interface IWalletBalance {
	value: number;
}

export class WalletBalance implements IWalletBalance {
	private readonly _value: number;
	public static readonly MINIMUM_BALANCE_AMOUNT = 0;

	private constructor(value: number) {
		this._value = value;
	}

	public static create(balance: number): Result<WalletBalance> {
		if (balance < WalletBalance.MINIMUM_BALANCE_AMOUNT) {
			return Result.fail(
				`Invalid balance amount. Balance must be greater than or equal to ${WalletBalance.MINIMUM_BALANCE_AMOUNT}.`,
			);
		}

		return Result.ok(new WalletBalance(balance));
	}

	public get value(): number {
		return this._value;
	}
}
