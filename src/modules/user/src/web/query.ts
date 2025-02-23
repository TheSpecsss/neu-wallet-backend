import { FindUserByIdUseCase } from "@/modules/user/src/useCase/findUserByIdUseCase";
import { GetUserBalanceByUserIdUseCase } from "@/modules/user/src/useCase/getUserBalanceByUserIdUseCase";
import { throwInvalidTokenError } from "@/shared/infrastructure/http/helpers/errors";
import { idArg, nonNull, queryType } from "nexus";

export default queryType({
	definition(t) {
		t.field("findUserById", {
			type: "User",
			args: { id: nonNull(idArg()) },
			resolve: async (_, { id }, ctx) => {
				if (!ctx?.user) throwInvalidTokenError();

				const useCase = new FindUserByIdUseCase();
				return await useCase.execute(id);
			},
		});

		t.field("getUserBalanceByUserId", {
			type: "UserBalance",
			args: { userId: nonNull(idArg()) },
			resolve: async (_, { userId }, ctx) => {
				if (!ctx?.user) throwInvalidTokenError();

				const useCase = new GetUserBalanceByUserIdUseCase();
				return await useCase.execute(userId);
			},
		});
	},
});
