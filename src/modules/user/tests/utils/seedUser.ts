import { UserName } from "@/modules/user/src/domain/classes/userName";
import { type IUserRawObject, USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { db } from "@/shared/infrastructure/database";
import { faker } from "@faker-js/faker";

export const seedUser = async (
	partialSchemaObject: Partial<IUserRawObject> = {},
): Promise<IUserRawObject> => {
	const defaultSchemaObject = {
		id: new SnowflakeID().toString(),
		name: faker.string.sample({
			min: UserName.MINIMUM_USERNAME_LENGTH,
			max: UserName.MAXIMUM_USERNAME_LENGTH,
		}),
		email: faker.internet.email({ provider: "neu.edu.ph" }),
		password: faker.internet.password(),
		accountType: faker.helpers.arrayElement(Object.values(USER_ACCOUNT_TYPE)),
		isDeleted: false,
		deletedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return await db.user.create({
		data: { ...defaultSchemaObject, ...partialSchemaObject },
	});
};
