import { PayUseCase } from "@/modules/wallet/src/useCase/payUseCase";
import { TopUpByIDUseCase } from "@/modules/wallet/src/useCase/topUpByIDUseCase";
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
				topUpCashierId: nonNull(stringArg()),
				amount: nonNull(intArg()),
			},
			resolve: (_, { receiverId, amount, }, ctx) => {
				const useCase = new TopUpByIDUseCase();
				return useCase.execute({
					topUpCashierId : ctx.user.idValue,
					amount,
					receiverId,
				});
			},
		});
	},
});
