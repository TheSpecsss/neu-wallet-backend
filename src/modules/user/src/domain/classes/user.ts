import type { UserAccountType } from "@/modules/user/src/domain/classes/userAccountType";
import type { UserEmail } from "@/modules/user/src/domain/classes/userEmail";
import type { UserName } from "@/modules/user/src/domain/classes/userName";
import type { SnowflakeID } from "@/shared/domain/snowflakeId";

export interface IUserData {
	id: SnowflakeID;
	name: UserName;
	email: UserEmail;
	password: string;
	accountType: UserAccountType;
	isDeleted: boolean;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	// TODO: Wallet
	// TODO: Transactions
}

export interface IUser extends IUserData {
	idValue: string;
	nameValue: string;
	emailValue: string;
	accountTypeValue: string;
}

export class User implements IUser {
	private readonly _id: SnowflakeID;
	private readonly _name: UserName;
	private readonly _email: UserEmail;
	private readonly _password: string;
	private readonly _accountType: UserAccountType;
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

	get name(): UserName {
		return this._name;
	}

	get nameValue(): string {
		return this.name.value;
	}

	get email(): UserEmail {
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
