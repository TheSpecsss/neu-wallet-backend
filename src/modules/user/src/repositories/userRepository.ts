import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import type { Pagination, QueryOptions } from "@/shared/constant";
import { db } from "@/shared/infrastructure/database";

export interface UserHydrateOption {
	wallet?: boolean;
	executorAuditLogs?: boolean;
	targetAuditLogs?: boolean;
	sentTransactions?: boolean;
	receivedTransactions?: boolean;
}

export interface IUserRepository {
	findUserByEmail(email: string): Promise<IUser | null>;
	findUserById(
		userId: string,
		options?: QueryOptions,
		hydrate?: UserHydrateOption,
	): Promise<IUser | null>;
	findUsersByIds(
		userIds: string[],
		options?: QueryOptions,
		hydrate?: UserHydrateOption,
	): Promise<IUser[]>;
	findUsersByPagination(
		pagination: Pagination,
		options?: QueryOptions,
		hydrate?: UserHydrateOption,
	): Promise<IUser[]>;
	getUsersTotalPages(perPage: number, includeDeleted?: boolean): Promise<number>;
	updateUser(user: IUser): Promise<IUser | null>;
}

export class UserRepository implements IUserRepository {
	constructor(
		private _database = db.user,
		private _mapper = UserMapper,
	) {}

	public async findUserByEmail(email: string): Promise<IUser | null> {
		const userRaw = await this._database.findUnique({
			where: { email },
		});
		if (userRaw === null) {
			return null;
		}

		return this._mapper.toDomain(userRaw);
	}

	async findUserById(
		userId: string,
		options?: QueryOptions,
		hydrate?: UserHydrateOption,
	): Promise<IUser | null> {
		const users = await this.findUsersByIds([userId], options, hydrate);
		if (!users[0]) {
			return null;
		}

		return users[0];
	}

	public async findUsersByIds(
		userIds: string[],
		options?: QueryOptions,
		hydrate?: UserHydrateOption,
	): Promise<IUser[]> {
		const usersRaw = await this._database.findMany({
			where: {
				id: { in: userIds },
				...this._deletedFilter(options?.includeDeleted),
			},
			include: this._hydrateFilter(hydrate),
		});

		return usersRaw.map((user) => this._mapper.toDomain(user));
	}

	public async findUsersByPagination(
		pagination: Pagination,
		options?: QueryOptions,
		hydrate?: UserHydrateOption,
	): Promise<IUser[]> {
		const usersRaw = await this._database.findMany({
			skip: pagination.start,
			take: pagination.size,
			where: this._deletedFilter(options?.includeDeleted),
			include: this._hydrateFilter(hydrate),
			orderBy: [{ createdAt: "asc" }],
		});

		return usersRaw.map((user) => this._mapper.toDomain(user));
	}

	public async getUsersTotalPages(perPage: number, includeDeleted?: boolean): Promise<number> {
		const totalCount = await this._database.count({
			where: this._deletedFilter(includeDeleted),
		});
		return Math.ceil(totalCount / perPage);
	}

	public async updateUser(user: IUser): Promise<IUser | null> {
		try {
			const userRaw = await this._database.update({
				where: { id: user.idValue },
				data: this._mapper.toPersistence(user),
			});

			return this._mapper.toDomain(userRaw);
		} catch {
			return null;
		}
	}

	private _deletedFilter(includeDeleted?: boolean) {
		if (includeDeleted) return {};

		return {
			isDeleted: false,
		};
	}

	private _hydrateFilter(hydrate?: UserHydrateOption) {
		return {
			wallet: hydrate?.wallet ?? true,
			executorAuditLogs: hydrate?.executorAuditLogs ?? true,
			targetAuditLogs: hydrate?.targetAuditLogs ?? true,
			sentTransactions: hydrate?.sentTransactions ?? true,
			receivedTransactions: hydrate?.receivedTransactions ?? true,
		};
	}
}
