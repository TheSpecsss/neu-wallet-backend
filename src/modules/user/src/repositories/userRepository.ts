import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import type { Pagination, QueryOptions } from "@/shared/constant";
import { db } from "@/shared/infrastructure/database";
import { Prisma } from "@prisma/client";

export interface UserHydrateOption {
	wallet?: boolean;
	sentTransactions?: boolean;
	receivedTransactions?: boolean;
}

export interface IUserRepository {
	createUser(user: IUser): Promise<void>;
	findUserByEmail(email: string): Promise<IUser | null>;
	findUserByEmailAndPassword(email: string, password: string): Promise<IUser | null>;
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
}

export class UserRepository implements IUserRepository {
	private _database;
	private _mapper;

	constructor(database = db.user, mapper = UserMapper) {
		this._database = database;
		this._mapper = mapper;
	}

	async createUser(user: IUser): Promise<void> {
		const userPersistenceObject = this._mapper.toPersistence(user);

		try {
			await this._database.create({ data: userPersistenceObject });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
				throw new Error(
					`Unique constraint failed on the fields: (\`${(error.meta!.target as unknown[])[0]}\`)`,
				);
			}
		}
	}

	public async findUserByEmail(email: string): Promise<IUser | null> {
		const userRaw = await this._database.findUnique({
			where: { email }
		});
		if (userRaw === null) {
			return null;
		}

		return this._mapper.toDomain(userRaw);
	}

	public async findUserByEmailAndPassword(email: string, password: string): Promise<IUser | null> {
		const userRaw = await this._database.findUnique({
			where: {
				email,
				password,
			},
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

		if (users.length === 0) {
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

	private _deletedFilter(includeDeleted?: boolean) {
		if (includeDeleted) return {};

		return {
			isDeleted: false,
		};
	}

	private _hydrateFilter(hydrate?: UserHydrateOption) {
		return {
			wallet: hydrate?.wallet ?? false,
			sentTransactions: hydrate?.sentTransactions ?? false,
			receivedTransactions: hydrate?.receivedTransactions ?? false,
		};
	}
}
