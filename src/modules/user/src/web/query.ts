import { FindUserByIdUseCase } from "@/modules/user/src/useCase/findUserByIdUseCase";
import { GetUserBalanceByUserIdUseCase } from "@/modules/user/src/useCase/getUserBalanceByUserIdUseCase";
import { GetUsersByPaginationUseCase } from "@/modules/user/src/useCase/getUsersByPaginationUseCase";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
import { extendType, intArg, nonNull } from "nexus";

export default extendType({
	type: "Query",
	definition(t) {
		t.field("getUser", {
			authorize: requireVerifiedUser,
			type: "User",
			resolve: async (_, __, ctx) => {
				const useCase = new FindUserByIdUseCase();
				return await useCase.execute({ userId: ctx.user.idValue });
			},
		});
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
			resolve: async (_, { perPage, page }, __) => {
				const useCase = new GetUsersByPaginationUseCase();
				return await useCase.execute({
					perPage,
					page,
				});
			},
		});
	},
});
