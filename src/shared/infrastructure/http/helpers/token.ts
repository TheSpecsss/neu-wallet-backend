import { decode } from "jsonwebtoken";

export interface DecodedToken {
	email: string;
	password: string;
	iat: number;
	exp: number;
}

export const userFromToken = (token: string) => {
	const decoded = decode(token.replace("Bearer ", ""), { json: true });

	return decoded ? (decoded as DecodedToken) : null;
};
