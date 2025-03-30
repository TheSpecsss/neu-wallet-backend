import type { IUser } from "@/modules/user/src/domain/classes/user";
import { requireUser } from "@/shared/infrastructure/http/authorization/requireUser";
import { UnverifiedUserError } from "@/shared/infrastructure/http/helpers/errors";

export const requireVerifiedUser = (
	root: unknown,
	args: unknown,
	ctx: { user: IUser | null } | undefined,
) => {
	if (!ctx?.user?.isVerified) {
		throw new UnverifiedUserError();
	}

	return requireUser(root, args, ctx);
};
