import { LoginUserUseCase } from "@/modules/user/src/useCase/loginUserUseCase";
import { RegisterUserUseCase } from "@/modules/user/src/useCase/registerUserUseCase";
import { extendType, nonNull, stringArg } from "nexus";

export default extendType({
	type: "Mutation",
	definition(t) {
		t.field("register", {
			type: "User",
			args: {
				email: nonNull(stringArg()),
				name: nonNull(stringArg()),
				password: nonNull(stringArg()),
				confirmPassword: nonNull(stringArg()),
			},
			resolve: (_, args) => {
				const useCase = new RegisterUserUseCase();
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
