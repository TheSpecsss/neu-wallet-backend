import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
import { NoAdminPermissionError } from "@/shared/infrastructure/http/helpers/errors";

export const requireAdminUser = async (
	root: unknown,
	args: unknown,
	ctx: { user: IUser | null } | undefined,
) => {
	const roleService = new UserRoleManagementService();

	if (!ctx?.user || !(await roleService.hasPermission(ctx.user, USER_ACCOUNT_TYPE.ADMIN))) {
		throw new NoAdminPermissionError();
	}

	return requireVerifiedUser(root, args, ctx);
};
