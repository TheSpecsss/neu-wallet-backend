import bcrypt from "bcrypt";

export const comparePassword = async (
	rawPassword: string,
	hashPassword: string,
): Promise<boolean> => {
	return await bcrypt.compare(rawPassword, hashPassword);
};
