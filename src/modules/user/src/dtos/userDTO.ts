import type { QueryOptions } from "@/shared/constant";

export interface FindUsersWithPaginationDTO {
	perPage: number;
	page: number;
	options?: QueryOptions;
}
