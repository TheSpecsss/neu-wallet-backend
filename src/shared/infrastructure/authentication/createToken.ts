import jwt from "jsonwebtoken";

export const createToken = (email: string, password: string): string => {
	return jwt.sign({ email, password }, process.env.JWT_SECRET as string, {
		expiresIn: "7d",
	});
};
