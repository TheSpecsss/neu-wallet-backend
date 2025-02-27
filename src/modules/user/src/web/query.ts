import { GetUserBalanceByUserIdUseCase } from "@/modules/user/src/useCase/getUserBalanceByUserIdUseCase";
import { throwInvalidTokenError } from "@/shared/infrastructure/http/helpers/errors";
import { extendType } from "nexus";

export default extendType({
	type: "Query",
	definition(t) {
		t.field("getUserBalanceByUserId", {
			type: "UserBalance",
			resolve: async (_, __, ctx) => {
				if (!ctx?.user) throwInvalidTokenError();

				const useCase = new GetUserBalanceByUserIdUseCase();
				return await useCase.execute(ctx.user.idValue);
			},
		});
	},
});
