import { UserName } from "@/modules/user/src/domain/classes/userName";
import { UserFactory } from "@/modules/user/src/domain/factory";
import { type IUserRawObject, USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { saltPassword } from "@/shared/infrastructure/authentication/saltPassword";
import { faker } from "@faker-js/faker";

export const createUserDomainObject = async (partialDomainObject: Partial<IUserRawObject> = {}) => {
	const defaultDomainObject = {
		id: new SnowflakeID().toString(),
		name: faker.string.sample({
			min: UserName.MINIMUM_USERNAME_LENGTH,
			max: UserName.MAXIMUM_USERNAME_LENGTH,
		}),
		email: faker.internet.email({ provider: "neu.edu.ph" }),
		password: await saltPassword(faker.internet.password()),
		accountType: faker.helpers.arrayElement(Object.values(USER_ACCOUNT_TYPE)),
		wallet: null,
		executorAuditLogs: [],
		targetAuditLogs: [],
		sentTransactions: [],
		receivedTransactions: [],
		isDeleted: false,
		isVerified: true,
		deletedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return UserFactory.create({ ...defaultDomainObject, ...partialDomainObject }).getValue();
};
