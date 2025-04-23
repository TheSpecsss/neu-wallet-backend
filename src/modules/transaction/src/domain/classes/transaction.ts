import {
	type ITransactionStatus,
	TransactionStatus,
} from "@/modules/transaction/src/domain/classes/transactionStatus";
import type { ITransactionType } from "@/modules/transaction/src/domain/classes/transactionType";
import type { TransactionStatusKind } from "@/modules/transaction/src/domain/shared/constant";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { SnowflakeID } from "@/shared/domain/snowflakeId";

export interface ITransactionData {
	id: SnowflakeID;
	senderId: SnowflakeID;
	sender: IUser | null;
	receiverId: SnowflakeID;
	receiver: IUser | null;
	amount: number;
	type: ITransactionType;
	status: ITransactionStatus;
	createdAt: Date;
}

export interface ITransaction extends ITransactionData {
	idValue: string;
	senderIdValue: string;
	receiverIdValue: string;
	typeValue: string;
	statusValue: string;
	updateStatus(status: TransactionStatusKind): void;
}

export class Transaction implements ITransaction {
	private readonly _id: SnowflakeID;
	private readonly _senderId: SnowflakeID;
	private readonly _sender: IUser | null;
	private readonly _receiverId: SnowflakeID;
	private readonly _receiver: IUser | null;
	private readonly _amount: number;
	private readonly _type: ITransactionType;
	private _status: ITransactionStatus;
	private readonly _createdAt: Date;

	constructor(data: ITransactionData) {
		this._id = data.id;
		this._senderId = data.senderId;
		this._sender = data.sender;
		this._receiverId = data.receiverId;
		this._receiver = data.receiver;
		this._amount = data.amount;
		this._type = data.type;
		this._status = data.status;
		this._createdAt = data.createdAt;
	}

	get id(): SnowflakeID {
		return this._id;
	}

	get idValue(): string {
		return this.id.toString();
	}

	get senderId(): SnowflakeID {
		return this._senderId;
	}

	get senderIdValue(): string {
		return this.senderId.toString();
	}

	get sender(): IUser | null {
		return this._sender;
	}

	get receiverId(): SnowflakeID {
		return this._receiverId;
	}

	get receiverIdValue(): string {
		return this.receiverId.toString();
	}

	get receiver(): IUser | null {
		return this._receiver;
	}

	get amount(): number {
		return this._amount;
	}

	get type(): ITransactionType {
		return this._type;
	}

	get typeValue(): string {
		return this.type.value;
	}

	get status(): ITransactionStatus {
		return this._status;
	}

	get statusValue(): string {
		return this.status.value;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	public updateStatus(status: TransactionStatusKind): void {
		const statusOrError = TransactionStatus.create(status);
		if (statusOrError.isFailure) {
			throw new Error(statusOrError.getErrorMessage() ?? "Failed to update transaction's status");
		}

		this._status = statusOrError.getValue();
	}

	public static create(props: ITransactionData): ITransaction {
		return new Transaction(props);
	}
}
