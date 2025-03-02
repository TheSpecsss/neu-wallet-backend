import bcrypt from "bcrypt";

export const saltPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, 10);
};
