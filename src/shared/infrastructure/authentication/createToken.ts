import jwt from "jsonwebtoken";

export const createToken = (tokenProps: {
	userId: string;
	email: string;
	accountType: string;
}): string => {
	return jwt.sign(tokenProps, process.env.JWT_SECRET as string, {
		expiresIn: "12h",
	});
};
