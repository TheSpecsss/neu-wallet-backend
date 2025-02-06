import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import type { Pagination, QueryOptions } from "@/shared/constant";
import { db } from "@/shared/infrastructure/database";

// TODO: Enable when wallet or transactions module are implemented
// interface HydrateOption {
// 	wallet: boolean;
//  transactions: boolean
// }

export interface IUserRepository {
	findUserById(userId: string, options?: QueryOptions): Promise<IUser | null>;
	findUsersByIds(userIds: string[], options?: QueryOptions): Promise<IUser[]>;
	findUsersByPagination(pagination: Pagination, options?: QueryOptions): Promise<IUser[]>;
	getUsersTotalPages(perPage: number, includeDeleted?: boolean): Promise<number>;
}

export class UserRepository implements IUserRepository {
	private _userDatabase;
	private _userMapper;

	constructor(userDatabase = db.user, userMapper = UserMapper) {
		this._userDatabase = userDatabase;
		this._userMapper = userMapper;
	}

	async findUserById(userId: string, options?: QueryOptions): Promise<IUser | null> {
		const users = await this.findUsersByIds([userId], options);

		if (users.length === 0) {
			return null;
		}

		return users[0];
	}

	public async findUsersByIds(userIds: string[], options?: QueryOptions): Promise<IUser[]> {
		const usersRaw = await this._userDatabase.findMany({
			where: {
				id: { in: userIds },
				...this._deletedUserFilter(options?.includeDeleted),
			},
		});

		return usersRaw.map((user) => this._userMapper.toDomain(user));
	}

	public async findUsersByPagination(
		pagination: Pagination,
		options?: QueryOptions,
	): Promise<IUser[]> {
		const usersRaw = await this._userDatabase.findMany({
			skip: pagination.start,
			take: pagination.size,
			where: this._deletedUserFilter(options?.includeDeleted),
			orderBy: [{ createdAt: "asc" }],
		});

		return usersRaw.map((user) => this._userMapper.toDomain(user));
	}

	public async getUsersTotalPages(perPage: number, includeDeleted?: boolean): Promise<number> {
		const totalCount = await this._userDatabase.count({
			where: this._deletedUserFilter(includeDeleted),
		});
		return Math.ceil(totalCount / perPage);
	}

	private _deletedUserFilter(includeDeleted?: boolean) {
		if (includeDeleted) return {};

		return {
			isDeleted: false,
		};
	}
}
