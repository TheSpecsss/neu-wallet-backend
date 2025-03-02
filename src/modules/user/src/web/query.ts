import { GetUserBalanceByUserIdUseCase } from "@/modules/user/src/useCase/getUserBalanceByUserIdUseCase";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
import { extendType } from "nexus";

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
	},
});
