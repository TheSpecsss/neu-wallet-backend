import type { TransactionHydrateOption } from "@/modules/transaction/src/repositories/transactionRepository";
import { GetRecentTransactionsByUserIdUseCase } from "@/modules/transaction/src/useCase/getRecentTransactionsByUserIdUseCase";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
import { extendType, intArg, nonNull, nullable } from "nexus";
import { defaultTo } from "rambda";

export default extendType({
	type: "Query",
	definition(t) {
		t.field("getRecentTransactionByUserId", {
			authorize: requireVerifiedUser,
			type: "TransactionByUserIdWithPagination",
			args: {
				perPage: nonNull(intArg()),
				page: nonNull(intArg()),
				hydrate: nullable("TransactionHydrateOption"),
			},
			resolve: async (_, { perPage, page, hydrate }, ctx) => {
				const useCase = new GetRecentTransactionsByUserIdUseCase();
				return await useCase.execute({
					userId: ctx.user.idValue,
					perPage,
					page,
					hydrate: defaultTo(undefined, hydrate as TransactionHydrateOption),
				});
			},
		});
	},
});
