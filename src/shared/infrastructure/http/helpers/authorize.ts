import { UserService } from "@/modules/user/src";
import type { IUser } from "@/modules/user/src/domain/classes/user";
import { userFromToken } from "@/shared/infrastructure/http/helpers/token";
import type { ApolloFastifyContextFunction } from "@as-integrations/fastify";

export interface Context {
	user: IUser | null;
}

export const authorize: ApolloFastifyContextFunction<Context> = async (req) => {
	const token = req.headers.authorization;
	if (!token) {
		return { user: null };
	}

	const decodedToken = userFromToken(token);
	if (!decodedToken) {
		return { user: null };
	}

	const userService = new UserService();
	const user = await userService.findUserByEmailAndPassword({
		email: decodedToken.email,
		password: decodedToken.password,
	});

	return { user };
};
