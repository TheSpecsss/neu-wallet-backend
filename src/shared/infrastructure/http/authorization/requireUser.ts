import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UnauthorizedError } from "@/shared/infrastructure/http/helpers/errors";

export const requireUser = (_: unknown, __: unknown, ctx: { user: IUser | null } | undefined) => {
	if (!ctx?.user) {
		throw new UnauthorizedError();
	}

	return true;
};
