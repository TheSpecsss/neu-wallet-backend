import { CreateUserUseCase } from "@/modules/user/src/useCase/createUserUseCase";
import { LoginUserUseCase } from "@/modules/user/src/useCase/loginUserUseCase";
import { extendType, nonNull, stringArg } from "nexus";

export default extendType({
	type: "Mutation",
	definition(t) {
		t.field("createUser", {
			type: "User",
			args: {
				email: nonNull(stringArg()),
				name: nonNull(stringArg()),
				password: nonNull(stringArg()),
				confirmPassword: nonNull(stringArg()),
			},
			resolve: (_, args) => {
				const useCase = new CreateUserUseCase();
				return useCase.execute(args);
			},
		});
		t.field("login", {
			type: "Login",
			args: {
				email: nonNull(stringArg()),
				password: nonNull(stringArg()),
			},
			resolve: (_, args) => {
				const useCase = new LoginUserUseCase();
				return useCase.execute(args);
			},
		});
	},
});
