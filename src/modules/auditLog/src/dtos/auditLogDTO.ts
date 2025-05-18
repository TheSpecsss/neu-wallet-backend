import type { ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";
import type { IAuditLogHydrateOption } from "@/modules/auditLog/src/repositories/auditLogRepository";
import type { OrderBy } from "@/shared/constant";

export interface GetAuditLogsByPaginationDTO {
	page: number;
	perPage: number;
}

export interface GetAuditLogsByFilterAndPaginationDTO {
	perPage: number;
	page: number;
	userId: string;
	hydrate?: IAuditLogHydrateOption;
	orderBy?: OrderBy;
	filter?: {
		startDate?: Date;
		endDate?: Date;
		actionTypes?: ActionTypeKind[];
		id?: string;
		name?: string;
		email?: string;
	};
}
