import type { TransactionHydrateOption } from "@/modules/transaction/src/repositories/transactionRepository";
import { GetRecentTransactionsByUserIdUseCase } from "@/modules/transaction/src/useCase/getRecentTransactionsByUserIdUseCase";
import { throwInvalidTokenError } from "@/shared/infrastructure/http/helpers/errors";
import { extendType, intArg, nonNull, nullable } from "nexus";
import { defaultTo } from "rambda";

export default extendType({
	type: "Query",
	definition(t) {
		t.field("getRecentTransactionByUserId", {
			type: "TransactionByUserIdWithPagination",
			args: {
				perPage: nonNull(intArg()),
				page: nonNull(intArg()),
				hydrate: nullable("TransactionHydrateOption"),
			},
			resolve: async (_, { perPage, page, hydrate }, ctx) => {
				if (!ctx?.user) throwInvalidTokenError();

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
