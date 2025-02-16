import { CreateUserUseCase } from "@/modules/user/src/useCase/createUserUseCase";
import { LoginUserUseCase } from "@/modules/user/src/useCase/loginUserUseCase";
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
