import type { UserHydrateOption } from "@/modules/user/src/repositories/userRepository";
import type { QueryOptions } from "@/shared/constant";

export interface FindUsersWithPaginationDTO {
	perPage: number;
	page: number;
	options?: QueryOptions;
	hydrate?: UserHydrateOption;
}
