import type { IUser } from "@/modules/user/src/domain/classes/user";
import {
	type IVerificationStatus,
	VerificationStatus,
} from "@/modules/verification/src/domain/classes/verificationStatus";
import type { SnowflakeID } from "@/shared/domain/snowflakeId";
import { defaultTo } from "rambda";

export interface IVerificationData {
	id: SnowflakeID;
	userId: SnowflakeID;
	code: string;
	status: IVerificationStatus;
	expiredAt: Date;
	createdAt: Date;
	updatedAt: Date;
	user: IUser | null;
}

export interface IVerification extends IVerificationData {
	idValue: string;
	userIdValue: string;
	statusValue: string;
	updateCode(code: string): void;
	updateStatus(status: string): void;
	updateExpiration(expiredAt: Date): void;
}

export class Verification implements IVerification {
	private readonly _id: SnowflakeID;
	private readonly _userId: SnowflakeID;
	private _code: string;
	private _status: IVerificationStatus;
	private _expiredAt: Date;
	private readonly _createdAt: Date;
	private readonly _updatedAt: Date;
	private readonly _user: IUser | null;

	constructor(data: IVerificationData) {
		this._id = data.id;
		this._userId = data.userId;
		this._code = data.code;
		this._status = data.status;
		this._expiredAt = data.expiredAt;
		this._createdAt = data.createdAt;
		this._updatedAt = data.updatedAt;
		this._user = data.user;
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

	get code(): string {
		return this._code;
	}

	get status(): IVerificationStatus {
		return this._status;
	}

	get statusValue(): string {
		return this.status.value;
	}

	get expiredAt(): Date {
		return this._expiredAt;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}

	get user(): IUser | null {
		return this._user;
	}

	updateCode(code: string): void {
		this._code = code;
	}

	updateStatus(status: string): void {
		const statusOrError = VerificationStatus.create(status);
		if (statusOrError.isFailure) {
			throw new Error(
				defaultTo("Failed to create Verification Status", statusOrError.getErrorMessage()),
			);
		}

		this._status = statusOrError.getValue();
	}

	updateExpiration(expiredAt: Date): void {
		this._expiredAt = expiredAt;
	}

	public static create(props: IVerificationData): IVerification {
		return new Verification(props);
	}
}
