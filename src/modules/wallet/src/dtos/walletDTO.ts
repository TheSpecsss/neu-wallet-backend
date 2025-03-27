export interface PayDTO {
	senderId: string;
	cashierId: string;
	amount: number;
}

export interface TopUpByUserIdDTO {
	receiverId: string;
	topUpCashierId: string;
	amount: number;
}

export interface SetBalanceByUserIdDTO {
	userId: string;
	executorId: string;
	balance: number;
}

export interface TransferBalanceByUserIdDTO {
	receiverId: string;
	senderId: string;
	amount: number;
}
