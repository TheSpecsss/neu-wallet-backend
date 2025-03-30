import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import type { GetAuditLogsByPaginationDTO } from "@/modules/auditLog/src/dtos/auditLogDTO";
import { AuditLogRepository } from "@/modules/auditLog/src/repositories/auditLogRepository";

export interface GetAuditLogsByPaginationResponseDTO {
	auditLogs: IAuditLog[];
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	totalPages: number;
}

export class GetAuditLogsByPaginationUseCase {
	constructor(private _auditLogsRepository = new AuditLogRepository()) {}

	public async execute(
		dto: GetAuditLogsByPaginationDTO,
	): Promise<GetAuditLogsByPaginationResponseDTO> {
		const { perPage, page } = dto;

		this._validatePaginationParameters(perPage, page);

		const auditLogs = await this._auditLogsRepository.getAuditLogsByPagination({
			start: (page - 1) * perPage,
			size: perPage,
		});

		const totalPages = await this._auditLogsRepository.getAuditLogsTotalPages(perPage);

		return {
			auditLogs,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			page,
			totalPages,
		};
	}

	private _validatePaginationParameters(perPage: number, page: number): void {
		if (perPage < 1) {
			throw new Error("perPage must be greater than or equal to 1");
		}
		if (page < 1) {
			throw new Error("page must be greater than or equal to 1");
		}
	}
}
