import { FindUserByIdUseCase } from "@/modules/user/src/useCase/findUserByIdUseCase";
import { throwInvalidTokenError } from "@/shared/infrastructure/http/helpers/errors";
import { idArg, nonNull, queryType } from "nexus";

export default queryType({
	definition(t) {
		t.field("findUserById", {
			type: "User",
			args: { id: nonNull(idArg()) },
			resolve: (_, { id }, ctx) => {
				if (!ctx?.user) throwInvalidTokenError();

				const useCase = new FindUserByIdUseCase();
				return useCase.execute(id);
			},
		});
	},
});
