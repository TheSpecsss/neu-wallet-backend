import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogFactory, type IAuditLogFactory } from "@/modules/auditLog/src/domain/factory";
import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import {
	type ITransactionFactory,
	TransactionFactory,
} from "@/modules/transaction/src/domain/factory";
import { type IUser, User } from "@/modules/user/src/domain/classes/user";
import { UserAccountType } from "@/modules/user/src/domain/classes/userAccountType";
import { UserEmail } from "@/modules/user/src/domain/classes/userEmail";
import { UserName } from "@/modules/user/src/domain/classes/userName";
import { type IWalletFactory, WalletFactory } from "@/modules/wallet/src/domain/factory";
import { Result } from "@/shared/core/result";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { defaultTo, map, pipe } from "rambda";

export interface IUserFactory {
	id?: string;
	name: string;
	email: string;
	password: string;
	accountType: string;
	wallet?: IWalletFactory | null;
	executorAuditLogs?: IAuditLogFactory[];
	targetAuditLogs?: IAuditLogFactory[];
	sentTransactions?: ITransactionFactory[];
	receivedTransactions?: ITransactionFactory[];
	isDeleted: boolean;
	isVerified: boolean;
	deletedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export class UserFactory {
	public static create(props: IUserFactory): Result<IUser> {
		const userNameOrError = UserName.create(props.name);
		const userEmailOrError = UserEmail.create(props.email);
		const userAccountTypeOrError = UserAccountType.create(props.accountType);

		const guardResult = Result.combine([userNameOrError, userEmailOrError, userAccountTypeOrError]);
		if (guardResult.isFailure) return guardResult as Result<IUser>;

		return Result.ok<IUser>(
			User.create({
				...props,
				id: new SnowflakeID(props.id),
				name: userNameOrError.getValue(),
				email: userEmailOrError.getValue(),
				accountType: userAccountTypeOrError.getValue(),
				wallet: props.wallet ? WalletFactory.create(props.wallet).getValue() : null,
				executorAuditLogs: UserFactory._getAuditLogs(props.executorAuditLogs),
				targetAuditLogs: UserFactory._getAuditLogs(props.targetAuditLogs),
				sentTransactions: UserFactory._getTransactions(props.sentTransactions),
				receivedTransactions: UserFactory._getTransactions(props.receivedTransactions),
			}),
		);
	}

	private static _getAuditLogs(auditLogs?: IAuditLogFactory[]): IAuditLog[] {
		const createAuditLog = pipe(AuditLogFactory.create, (instance) => instance.getValue());

		return pipe(defaultTo([] as IAuditLogFactory[]), map(createAuditLog))(auditLogs);
	}

	private static _getTransactions(transactions?: ITransactionFactory[]): ITransaction[] {
		const createTransaction = pipe(TransactionFactory.create, (instance) => instance.getValue());

		return pipe(defaultTo([] as ITransactionFactory[]), map(createTransaction))(transactions);
	}
}
