export interface QueryOptions {
	includeDeleted?: boolean;
}

export interface Pagination {
	start: number;
	size: number;
}

export const ORDER_BY_VALUES = ["asc", "desc"] as const;
export type OrderBy = typeof ORDER_BY_VALUES[number];
