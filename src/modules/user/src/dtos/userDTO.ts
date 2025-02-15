import type { UserHydrateOption } from "@/modules/user/src/repositories/userRepository";
import type { QueryOptions } from "@/shared/constant";

export interface FindUsersWithPaginationDTO {
	perPage: number;
	page: number;
	options?: QueryOptions;
	hydrate?: UserHydrateOption;
}

export interface FindUserByEmailAndPasswordDTO {
	email: string;
	password: string;
}

export interface CreateUserDTO {
	email: string;
	name: string;
	password: string;
	confirmPassword: string;
	type: string;
}
