import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { AuditLogMapper } from "@/modules/auditLog/src/mappers/auditLogMapper";
import { db } from "@/shared/infrastructure/database";

export interface IAuditLogHydrateOption {
	executor?: boolean;
	target?: boolean;
}

export interface IAuditLogRepository {
	findAuditLogById(auditLogId: string, hydrate?: IAuditLogHydrateOption): Promise<IAuditLog | null>;
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
