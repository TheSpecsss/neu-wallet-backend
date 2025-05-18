import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import type { ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";
import { AuditLogMapper } from "@/modules/auditLog/src/mappers/auditLogMapper";
import type { OrderBy, Pagination } from "@/shared/constant";
import { db } from "@/shared/infrastructure/database";
import { addFilterCondition } from "@/shared/infrastructure/database/repositoryUtils";
import type { Prisma } from "@prisma/client";

export interface IAuditLogHydrateOption {
	executor?: boolean;
	target?: boolean;
}

export interface IAuditLogFilterOption {
	isAdmin?: boolean;
	date?: { from?: Date; to?: Date };
	actionTypes?: ActionTypeKind[];
	id?: string;
	name?: string;
	email?: string;
}

export interface IAuditLogRepository {
	findAuditLogById(auditLogId: string, hydrate?: IAuditLogHydrateOption): Promise<IAuditLog | null>;
	getAuditLogsByPagination(
		pagination: Pagination,
		hydrate?: IAuditLogHydrateOption,
	): Promise<IAuditLog[]>;
	getAuditLogsTotalPages(perPage: number): Promise<number>;
	getAuditLogsByFilterAndPagination(args: {
		pagination: Pagination;
		userId: string;
		hydrate?: IAuditLogHydrateOption;
		filter?: IAuditLogFilterOption;
		orderBy?: OrderBy;
	}): Promise<IAuditLog[]>;
	getAuditLogsByFilterAndPaginationTotalPages(
		perPage: number,
		userId: string,
		filter?: IAuditLogFilterOption,
	): Promise<number>;
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

	public async getAuditLogsByFilterAndPagination({
		pagination,
		userId,
		hydrate,
		filter = { isAdmin: false },
		orderBy,
	}: {
		pagination: Pagination;
		userId: string;
		hydrate?: IAuditLogHydrateOption;
		filter?: IAuditLogFilterOption;
		orderBy?: OrderBy;
	}): Promise<IAuditLog[]> {
		const auditLogsRaw = await this._database.findMany({
			where: this._auditLogFilter(userId, filter),
			skip: pagination.start,
			take: pagination.size,
			include: this._hydrateFilter(hydrate),
			orderBy: { createdAt: orderBy ?? "asc" },
		});

		return auditLogsRaw.map((auditLog) => this._mapper.toDomain(auditLog));
	}

	public async getAuditLogsByFilterAndPaginationTotalPages(
		perPage: number,
		userId: string,
		filter: IAuditLogFilterOption = { isAdmin: false },
	): Promise<number> {
		const totalCount = await this._database.count({
			where: this._auditLogFilter(userId, filter),
		});

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

	private _auditLogFilter(
		userId: string,
		filter: IAuditLogFilterOption,
	): Prisma.UserAuditLogWhereInput {
		if (!filter) return {};

		const where: Prisma.UserAuditLogWhereInput = {};

		if (filter.date) {
			where.createdAt = {};
			if (filter.date.from) {
				where.createdAt.gte = filter.date.from;
			}
			if (filter.date.to) {
				where.createdAt.lte = filter.date.to;
			}
		}

		if (filter.actionTypes && filter.actionTypes.length > 0) {
			where.actionType = { in: filter.actionTypes };
		}

		addFilterCondition(where, filter, "id", [
			{ executorId: filter.id },
			{ targetId: filter.id },
			{ id: filter.id },
		]);

		addFilterCondition(where, filter, "name", [
			{ executor: { name: { contains: filter.name, mode: "insensitive" } } },
			{ target: { name: { contains: filter.name, mode: "insensitive" } } },
		]);

		addFilterCondition(where, filter, "email", [
			{ executor: { email: { contains: filter.email, mode: "insensitive" } } },
			{ target: { email: { contains: filter.email, mode: "insensitive" } } },
		]);

		if (!filter.isAdmin) {
			const query = [{ executorId: userId }, { targetId: userId }];
			where.OR = [...(where.OR || []), ...query];
		}

		return where;
	}
}
