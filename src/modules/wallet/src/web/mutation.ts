import { PayUseCase } from "@/modules/wallet/src/useCase/payUseCase";
import { SetBalanceByUserIdUseCase } from "@/modules/wallet/src/useCase/setBalanceByUserIdUseCase";
import { TopUpByUserIdUseCase } from "@/modules/wallet/src/useCase/topUpByUserIdUseCase";
import { TransferBalanceByEmailUseCase } from "@/modules/wallet/src/useCase/transferBalanceByEmailUseCase";
import { TransferBalanceByUserIdUseCase } from "@/modules/wallet/src/useCase/transferBalanceByUserIdUseCase";
import { WithdrawBalanceByUserIdUseCase } from "@/modules/wallet/src/useCase/withdrawBalanceByUserIdUseCase";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
import { extendType, intArg, nonNull, stringArg } from "nexus";

export default extendType({
	type: "Mutation",
	definition(t) {
		t.field("pay", {
			authorize: requireVerifiedUser,
			type: "Wallet",
			args: {
				cashierId: nonNull(stringArg()),
				amount: nonNull(intArg()),
			},
			resolve: (_, { cashierId, amount }, ctx) => {
				const useCase = new PayUseCase();
				return useCase.execute({
					cashierId,
					amount,
					senderId: ctx.user.idValue,
				});
			},
		});
		t.field("topUp", {
			authorize: requireVerifiedUser,
			type: "Wallet",
			args: {
				receiverId: nonNull(stringArg()),
				amount: nonNull(intArg()),
			},
			resolve: (_, { receiverId, amount }, ctx) => {
				const useCase = new TopUpByUserIdUseCase();
				return useCase.execute({
					topUpCashierId: ctx.user.idValue,
					amount,
					receiverId,
				});
			},
		});
		t.field("setBalance", {
			authorize: requireVerifiedUser,
			type: "Wallet",
			args: {
				userId: nonNull(stringArg()),
				balance: nonNull(intArg()),
			},
			resolve: (_, { userId, balance }, ctx) => {
				const useCase = new SetBalanceByUserIdUseCase();
				return useCase.execute({
					executorId: ctx.user.idValue,
					userId,
					balance,
				});
			},
		});
		t.field("transferBalanceByUserId", {
			authorize: requireVerifiedUser,
			type: "WalletTransfer",
			args: {
				receiverId: nonNull(stringArg()),
				amount: nonNull(intArg()),
			},
			resolve: (_, { receiverId, amount }, ctx) => {
				const useCase = new TransferBalanceByUserIdUseCase();
				return useCase.execute({
					senderId: ctx.user.idValue,
					receiverId,
					amount,
				});
			},
		});
		t.field("withdrawBalance", {
			authorize: requireVerifiedUser,
			type: "Wallet",
			args: {
				topUpCashierId: nonNull(stringArg()),
				amount: nonNull(intArg()),
			},
			resolve: (_, { topUpCashierId, amount }, ctx) => {
				const useCase = new WithdrawBalanceByUserIdUseCase();
				return useCase.execute({
					senderId: ctx.user.idValue,
					topUpCashierId,
					amount,
				});
			},
		});
		t.field("transferBalanceByUserEmail", {
			authorize: requireVerifiedUser,
			type: "WalletTransfer",
			args: {
				receiverEmail: nonNull(stringArg()),
				amount: nonNull(intArg()),
			},
			resolve: (_, { receiverEmail, amount }, ctx) => {
				const useCase = new TransferBalanceByEmailUseCase();
				return useCase.execute({
					senderId: ctx.user.idValue,
					receiverEmail,
					amount,
				});
			},
		});
	},
});
