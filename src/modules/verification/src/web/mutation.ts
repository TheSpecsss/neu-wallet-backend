import { ConfirmVerificationUseCase } from "@/modules/verification/src/useCase/confirmVerificationUseCase";
import { ResendVerificationUseCase } from "@/modules/verification/src/useCase/resendVerificationUseCase";
import { extendType, nonNull, stringArg } from "nexus";

export default extendType({
	type: "Mutation",
	definition(t) {
		t.field("confirmVerification", {
			type: "Verification",
			args: {
				email: nonNull(stringArg()),
				code: nonNull(stringArg()),
			},
			resolve: (_, args) => {
				const useCase = new ConfirmVerificationUseCase();
				return useCase.execute(args);
			},
		});
		t.field("resendVerification", {
			type: "Verification",
			args: {
				email: nonNull(stringArg()),
			},
			resolve: (_, args) => {
				const useCase = new ResendVerificationUseCase();
				return useCase.execute(args);
			},
		});
	},
});
