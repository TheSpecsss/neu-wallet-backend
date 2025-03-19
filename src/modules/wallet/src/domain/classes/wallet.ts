import type { IUser } from "@/modules/user/src/domain/classes/user";
import {
	type IWalletBalance,
	WalletBalance,
} from "@/modules/wallet/src/domain/classes/walletBalance";
import type { SnowflakeID } from "@/shared/domain/snowflakeId";

export interface IWalletData {
	id: SnowflakeID;
	userId: SnowflakeID;
	user: IUser | null;
	balance: IWalletBalance;
	isDeleted: boolean;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface IWallet extends IWalletData {
	idValue: string;
	userIdValue: string;
	balanceValue: number;
	reduceBalance(amount: number): void;
	addBalance(amount: number): void;
}

export class Wallet implements IWallet {
	private readonly _id: SnowflakeID;
	private readonly _userId: SnowflakeID;
	private readonly _user: IUser | null;
	private _balance: IWalletBalance;
	private readonly _isDeleted: boolean;
	private readonly _deletedAt: Date | null;
	private readonly _createdAt: Date;
	private readonly _updatedAt: Date;

	constructor(data: IWalletData) {
		this._id = data.id;
		this._userId = data.userId;
		this._user = data.user;
		this._balance = data.balance;
		this._isDeleted = data.isDeleted;
		this._deletedAt = data.deletedAt;
		this._createdAt = data.createdAt;
		this._updatedAt = data.updatedAt;
	}

	get id(): SnowflakeID {
		return this._id;
	}

	get idValue(): string {
		return this.id.toString();
	}

	get userId(): SnowflakeID {
		return this._userId;
	}

	get userIdValue(): string {
		return this.userId.toString();
	}

	get user(): IUser | null {
		return this._user;
	}

	get balance(): IWalletBalance {
		return this._balance;
	}

	get balanceValue(): number {
		return this.balance.value;
	}

	get isDeleted(): boolean {
		return this._isDeleted;
	}

	get deletedAt(): Date | null {
		return this._deletedAt;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	reduceBalance(amount: number): void {
		const balance = WalletBalance.create(this.balanceValue - amount);
		if (balance.isFailure) {
			throw new Error(`Failed creating a wallet balance: ${balance.getErrorMessage()}`);
		}

		this._balance = balance.getValue();
	}

	addBalance(amount: number): void {
		const balance = WalletBalance.create(this.balanceValue + amount);
		if (balance.isFailure) {
			throw new Error(`Failed creating a wallet balance: ${balance.getErrorMessage()}`);
		}

		this._balance = balance.getValue();
	}

	public static create(props: IWalletData): IWallet {
		return new Wallet(props);
	}
}
