import { FindUsersByPaginationUseCase } from "@/modules/user/src/useCase/findUsersByPaginationUseCase";
import { GetUserBalanceByUserIdUseCase } from "@/modules/user/src/useCase/getUserBalanceByUserIdUseCase";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
import { extendType, intArg, nonNull } from "nexus";

export default extendType({
	type: "Query",
	definition(t) {
		t.field("getUserBalanceByUserId", {
			authorize: requireVerifiedUser,
			type: "UserBalance",
			resolve: async (_, __, ctx) => {
				const useCase = new GetUserBalanceByUserIdUseCase();
				return await useCase.execute(ctx.user.idValue);
			},
		});
		t.field("getUsersByPagination", {
			authorize: requireVerifiedUser,
			type: "UserPagination",
			args: {
				perPage: nonNull(intArg()),
				page: nonNull(intArg()),
			},
			resolve: async (_, { perPage, page }, ctx) => {
				const useCase = new FindUsersByPaginationUseCase();
				return await useCase.execute({
					perPage,
					page,
					userId: ctx.user.idValue,
				});
			},
		});
	},
});
