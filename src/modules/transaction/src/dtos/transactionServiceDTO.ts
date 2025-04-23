import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";

export interface CreateTransactionServiceDTO {
	senderId: string;
	receiverId: string;
	amount: number;
	type: string;
	status?: string;
}

export type ExecuteTransactionCallback<T> = (transaction: ITransaction) => Promise<T>;
