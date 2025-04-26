import type { TransactionHydrateOption } from "@/modules/transaction/src/repositories/transactionRepository";
import { GetCashierTopUpTransactionsByPaginationUseCase } from "@/modules/transaction/src/useCase/getCashierTopUpTransactionsByPaginationUseCase";
import { GetCashierTransactionsByPaginationUseCase } from "@/modules/transaction/src/useCase/getCashierTransactionsByPaginationUseCase";
import { GetRecentTransactionsByUserIdUseCase } from "@/modules/transaction/src/useCase/getRecentTransactionsByUserIdUseCase";
import { requireAdminUser } from "@/shared/infrastructure/http/authorization/requireAdminUser";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
import { extendType, intArg, nonNull, nullable } from "nexus";
import { defaultTo } from "rambda";

export default extendType({
	type: "Query",
	definition(t) {
		t.field("getRecentTransactionsByUserId", {
			authorize: requireVerifiedUser,
			type: "TransactionsWithPagination",
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

		t.field("getCashierTransactionsByPagination", {
			authorize: requireAdminUser,
			type: "TransactionsWithPagination",
			args: {
				perPage: nonNull(intArg()),
				page: nonNull(intArg()),
				hydrate: nullable("TransactionHydrateOption"),
			},
			resolve: async (_, { perPage, page, hydrate }, ctx) => {
				const useCase = new GetCashierTransactionsByPaginationUseCase();
				return await useCase.execute({
					perPage,
					page,
					hydrate: defaultTo(undefined, hydrate as TransactionHydrateOption),
				});
			},
		});

		t.field("getCashierTopUpTransactionsByPagination", {
			authorize: requireAdminUser,
			type: "TransactionsWithPagination",
			args: {
				perPage: nonNull(intArg()),
				page: nonNull(intArg()),
				hydrate: nullable("TransactionHydrateOption"),
			},
			resolve: async (_, { perPage, page, hydrate }, ctx) => {
				const useCase = new GetCashierTopUpTransactionsByPaginationUseCase();
				return await useCase.execute({
					perPage,
					page,
					hydrate: defaultTo(undefined, hydrate as TransactionHydrateOption),
				});
			},
		});
	},
});
