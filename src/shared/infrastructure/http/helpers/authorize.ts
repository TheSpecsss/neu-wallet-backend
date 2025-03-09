import { UserService } from "@/modules/user/src";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import { verifyToken } from "@/shared/infrastructure/http/helpers/verifyToken";
import type { ApolloFastifyContextFunction } from "@as-integrations/fastify";

export interface Context {
	user: IUser | null;
}

export const authorize: ApolloFastifyContextFunction<Context> = async (req) => {
	const token = req.headers.authorization;
	if (!token) {
		return { user: null };
	}

	const decodedToken = verifyToken(token);
	if (!decodedToken) {
		return { user: null };
	}

	try {
		const userService = new UserService();
		const user = await userService.findUserById({
			userId: decodedToken.userId,
		});

		if (decodedToken.exp < Date.now() / 1000) {
			return { user: null };
		}

		return { user };
	} catch (error) {
		return { user: null };
	}
};
