import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserFactory } from "@/modules/user/src/domain/factory";
import type { IUserRawObject, IUserSchemaObject } from "@/modules/user/src/domain/shared/constant";

export class UserMapper {
	public static toDomain(rawData: IUserRawObject): IUser {
		return UserFactory.create(rawData).getValue();
	}

	public static toPersistence(user: IUser): IUserSchemaObject {
		return {
			id: user.idValue,
			name: user.nameValue,
			email: user.emailValue,
			password: user.password,
			accountType: user.accountTypeValue,
			isDeleted: user.isDeleted,
			deletedAt: user.deletedAt,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		};
	}
}
