import { verify } from "jsonwebtoken";

export interface DecodedToken {
	email: string;
	password: string;
}

export const userFromToken = (token: string) => {
	const secret = process.env.JWT_SECRET as string;

	const decoded = verify(token, secret);

	return decoded ? (decoded as DecodedToken) : null;
};
