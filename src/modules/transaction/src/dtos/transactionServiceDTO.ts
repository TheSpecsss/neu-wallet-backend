export interface CreateTransactionServiceDTO {
	senderId: string;
	receiverId: string;
	amount: number;
	type: string;
}
