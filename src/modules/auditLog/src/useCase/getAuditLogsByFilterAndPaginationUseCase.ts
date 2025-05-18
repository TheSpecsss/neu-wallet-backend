import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import type { GetAuditLogsByFilterAndPaginationDTO } from "@/modules/auditLog/src/dtos/auditLogDTO";
import { AuditLogRepository } from "@/modules/auditLog/src/repositories/auditLogRepository";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";

export interface GetAuditLogsByFilterAndPaginationResponseUseCase {
	auditLogs: IAuditLog[];
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	totalPages: number;
}

export class GetAuditLogsByFilterAndPaginationUseCase {
	constructor(
		private _auditLogsRepository = new AuditLogRepository(),
		private _userRoleManagementService = new UserRoleManagementService(),
	) {}

	public async execute(
		dto: GetAuditLogsByFilterAndPaginationDTO,
	): Promise<GetAuditLogsByFilterAndPaginationResponseUseCase> {
		const { perPage, page, userId, hydrate, orderBy, filter } = dto;

		const hasAdminPermission = await this._hasAdminPermission(userId);

		const auditLogs = await this._auditLogsRepository.getAuditLogsByFilterAndPagination({
			pagination: { start: (page - 1) * perPage, size: perPage },
			userId,
			hydrate,
			filter: {
				isAdmin: hasAdminPermission,
				date: { from: filter?.startDate, to: filter?.endDate },
				actionTypes: filter?.actionTypes,
				id: filter?.id,
				name: filter?.name,
				email: filter?.email,
			},
			orderBy,
		});

		const totalPages = await this._auditLogsRepository.getAuditLogsByFilterAndPaginationTotalPages(
			perPage,
			userId,
			{
				isAdmin: hasAdminPermission,
				date: { from: filter?.startDate, to: filter?.endDate },
				actionTypes: filter?.actionTypes,
				id: filter?.id,
				name: filter?.name,
				email: filter?.email,
			},
		);

		return {
			auditLogs,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			page,
			totalPages,
		};
	}

	private async _hasAdminPermission(userId: string): Promise<boolean> {
		return await this._userRoleManagementService.hasPermission(userId, USER_ACCOUNT_TYPE.ADMIN);
	}
}
