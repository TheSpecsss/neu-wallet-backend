import type { UserHydrateOption } from "@/modules/user/src/repositories/userRepository";
import type { QueryOptions } from "@/shared/constant";

export interface FindUsersWithPaginationDTO {
	perPage: number;
	page: number;
	hydrate?: UserHydrateOption;
}

export interface FindUserByEmailDTO {
	email: string;
}

export interface FindUserByIdDTO {
	userId: string;
	options?: QueryOptions;
	hydrate?: UserHydrateOption;
}

export interface FindUsersByIdsDTO {
	userIds: string[];
	options?: QueryOptions;
	hydrate?: UserHydrateOption;
}

export interface RegisterUserDTO {
	email: string;
	name: string;
	password: string;
	confirmPassword: string;
}

export interface LoginUserDTO {
	email: string;
	password: string;
}

export interface VerifyUserDTO {
	userId: string;
}
