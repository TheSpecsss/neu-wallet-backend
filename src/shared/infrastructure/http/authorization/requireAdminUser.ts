import type { IUser } from "@/modules/user/src/domain/classes/user";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
import { NoAdminPermissionError } from "@/shared/infrastructure/http/helpers/errors";

export const requireAdminUser = (
	root: unknown,
	args: unknown,
	ctx: { user: IUser | null } | undefined,
) => {
	if (ctx?.user?.accountTypeValue !== USER_ACCOUNT_TYPE.ADMIN) {
		throw new NoAdminPermissionError();
	}

	return requireVerifiedUser(root, args, ctx);
};
