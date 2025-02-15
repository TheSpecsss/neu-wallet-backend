import { CreateUserUseCase } from "@/modules/user/src/useCase/createUserUseCase";
import { mutationType, nonNull, stringArg } from "nexus";

export default mutationType({
	definition(t) {
		t.field("createUser", {
			type: "User",
			args: {
				email: nonNull(stringArg()),
				name: nonNull(stringArg()),
				password: nonNull(stringArg()),
				confirmPassword: nonNull(stringArg()),
				type: nonNull("UserAccountType"),
			},
			resolve: (_, args) => {
				const useCase = new CreateUserUseCase();
				return useCase.execute(args);
			},
		});
	},
});
