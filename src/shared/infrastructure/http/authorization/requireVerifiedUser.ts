import type { IUser } from "@/modules/user/src/domain/classes/user";
import {
	UnauthorizedError,
	UnverifiedUserError,
} from "@/shared/infrastructure/http/helpers/errors";

export const requireUser = (_: unknown, __: unknown, ctx: { user: IUser | null } | undefined) => {
	if (!ctx?.user) return new UnauthorizedError();

	return true;
};

export const requireVerifiedUser = (
	root: unknown,
	args: unknown,
	ctx: { user: IUser | null } | undefined,
) => {
	if (!ctx?.user?.isVerified) return new UnverifiedUserError();

	return requireUser(root, args, ctx);
};
