import { verify } from "jsonwebtoken";

export interface DecodedToken {
	userId: string;
	email: string;
	accountType: string;
	iat: number;
	exp: number;
}

export const verifyToken = (token: string): DecodedToken | null => {
	try {
		const verifiedToken = verify(token.replace("Bearer ", ""), process.env.JWT_SECRET as string);

		return verifiedToken as DecodedToken;
	} catch {
		return null;
	}
};
