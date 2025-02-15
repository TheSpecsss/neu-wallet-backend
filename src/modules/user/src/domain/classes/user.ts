import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import type { UserAccountType } from "@/modules/user/src/domain/classes/userAccountType";
import type { IUserEmail } from "@/modules/user/src/domain/classes/userEmail";
import type { IUserName } from "@/modules/user/src/domain/classes/userName";
import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import type { SnowflakeID } from "@/shared/domain/snowflakeId";

export interface IUserData {
	id: SnowflakeID;
	name: IUserName;
	email: IUserEmail;
	password: string;
	accountType: UserAccountType;
	wallet: IWallet | null;
	sentTransactions: ITransaction[];
	receivedTransactions: ITransaction[];
	isDeleted: boolean;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface IUser extends IUserData {
	idValue: string;
	nameValue: string;
	emailValue: string;
	accountTypeValue: string;
}

export class User implements IUser {
	private readonly _id: SnowflakeID;
	private readonly _name: IUserName;
	private readonly _email: IUserEmail;
	private readonly _password: string;
	private readonly _accountType: UserAccountType;
	private readonly _wallet: IWallet | null;
	private readonly _sentTransactions: ITransaction[];
	private readonly _receivedTransactions: ITransaction[];
	private readonly _isDeleted: boolean;
	private readonly _deletedAt: Date | null;
	private readonly _createdAt: Date;
	private readonly _updatedAt: Date;

	constructor(data: IUserData) {
		this._id = data.id;
		this._name = data.name;
		this._email = data.email;
		this._password = data.password;
		this._accountType = data.accountType;
		this._wallet = data.wallet;
		this._sentTransactions = data.sentTransactions;
		this._receivedTransactions = data.receivedTransactions;
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

	get name(): IUserName {
		return this._name;
	}

	get nameValue(): string {
		return this.name.value;
	}

	get email(): IUserEmail {
		return this._email;
	}

	get emailValue(): string {
		return this.email.value;
	}

	get password(): string {
		return this._password;
	}

	get accountType(): UserAccountType {
		return this._accountType;
	}

	get accountTypeValue(): string {
		return this.accountType.value;
	}

	get wallet(): IWallet | null {
		return this._wallet;
	}

	get sentTransactions(): ITransaction[] {
		return this._sentTransactions;
	}

	get receivedTransactions(): ITransaction[] {
		return this._receivedTransactions;
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

	public static create(props: IUserData): IUser {
		return new User(props);
	}
}
