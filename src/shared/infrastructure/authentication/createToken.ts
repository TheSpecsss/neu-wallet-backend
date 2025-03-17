import { verifyToken } from "@/shared/infrastructure/http/helpers/verifyToken";
import jwt from "jsonwebtoken";
import { defaultTo } from "rambda";

export const createToken = (tokenProps: {
	userId: string;
	email: string;
	accountType: string;
}): { token: string; expiresAt: string } => {
	const token = jwt.sign(tokenProps, process.env.JWT_SECRET as string, {
		expiresIn: "12h",
	});

	const decodedToken = verifyToken(token);

	return {
		token,
		expiresAt: String(defaultTo(0, decodedToken?.exp) * 1000),
	};
};
