import { LoginUserUseCase } from "@/modules/user/src/useCase/loginUserUseCase";
import { RegisterUserUseCase } from "@/modules/user/src/useCase/registerUserUseCase";
import { UpdateUserAccountTypeByUserIdUseCase } from "@/modules/user/src/useCase/updateUserAccountTypeByUserId";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
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
		t.field("updateUserAccountTypeByUserId", {
			authorize: requireVerifiedUser,
			type: "User",
			args: {
				userId: nonNull(stringArg()),
				accountType: nonNull(stringArg()),
			},
			resolve: (_, { userId, accountType }, ctx) => {
				const useCase = new UpdateUserAccountTypeByUserIdUseCase();
				return useCase.execute({
					userId,
					accountType,
					updatedById: ctx.user.idValue,
				});
			},
		});
	},
});
