export interface PayDTO {
	senderId: string;
	cashierId: string;
	amount: number;
}

export interface topUpByIDDTO {
	receiverId: string;
	topUpCashierId: string;
	amount: number;
}