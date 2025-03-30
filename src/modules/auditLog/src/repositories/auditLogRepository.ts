import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogMapper } from "@/modules/auditLog/src/mappers/auditLogMapper";
import type { Pagination } from "@/shared/constant";
import { db } from "@/shared/infrastructure/database";

export interface IAuditLogHydrateOption {
	executor?: boolean;
	target?: boolean;
}

export interface IAuditLogRepository {
	findAuditLogById(auditLogId: string, hydrate?: IAuditLogHydrateOption): Promise<IAuditLog | null>;
	getAuditLogsByPagination(
		pagination: Pagination,
		hydrate?: IAuditLogHydrateOption,
	): Promise<IAuditLog[]>;
	getAuditLogsTotalPages(perPage: number): Promise<number>;
	save(auditLog: IAuditLog, hydrate?: IAuditLogHydrateOption): Promise<IAuditLog>;
}

export class AuditLogRepository implements IAuditLogRepository {
	constructor(
		private _database = db.userAuditLog,
		private _mapper = AuditLogMapper,
	) {}

	public async findAuditLogById(
		auditLogId: string,
		hydrate?: IAuditLogHydrateOption,
	): Promise<IAuditLog | null> {
		const auditLogRaw = await this._database.findFirst({
			where: { id: auditLogId },
			include: this._hydrateFilter(hydrate),
		});
		if (!auditLogRaw) {
			return null;
		}

		return this._mapper.toDomain(auditLogRaw);
	}

	public async getAuditLogsByPagination(
		pagination: Pagination,
		hydrate?: IAuditLogHydrateOption,
	): Promise<IAuditLog[]> {
		const auditLogsRaw = await this._database.findMany({
			skip: pagination.start,
			take: pagination.size,
			include: this._hydrateFilter(hydrate),
			orderBy: [{ createdAt: "desc" }],
		});

		return auditLogsRaw.map((auditLog) => this._mapper.toDomain(auditLog));
	}

	public async getAuditLogsTotalPages(perPage: number): Promise<number> {
		if (perPage < 1) {
			throw new Error("perPage must be greater than or equal to 1");
		}

		const totalCount = await this._database.count();
		return Math.ceil(totalCount / perPage);
	}

	public async save(auditLog: IAuditLog, hydrate?: IAuditLogHydrateOption): Promise<IAuditLog> {
		const auditLogRaw = await this._database.create({
			data: this._mapper.toPersistence(auditLog),
			include: this._hydrateFilter(hydrate),
		});

		return this._mapper.toDomain(auditLogRaw);
	}

	private _hydrateFilter(hydrate?: IAuditLogHydrateOption) {
		return {
			executor: hydrate?.executor ?? true,
			target: hydrate?.target ?? true,
		};
	}
}
