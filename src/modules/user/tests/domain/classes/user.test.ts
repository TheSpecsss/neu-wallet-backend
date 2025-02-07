import { describe, expect, it } from "bun:test";
import { User } from "@/modules/user/src/domain/classes/user";
import { UserAccountType } from "@/modules/user/src/domain/classes/userAccountType";
import { UserEmail } from "@/modules/user/src/domain/classes/userEmail";
import { UserName } from "@/modules/user/src/domain/classes/userName";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("User", () => {
	const mockData = {
		id: new SnowflakeID(),
		name: UserName.create(
			faker.string.sample({
				min: UserName.MINIMUM_USERNAME_LENGTH,
				max: UserName.MAXIMUM_USERNAME_LENGTH,
			}),
		).getValue(),
		email: UserEmail.create(faker.internet.email({ provider: "neu.edu.ph" })).getValue(),
		password: faker.internet.password(),
		accountType: UserAccountType.create(
			faker.helpers.arrayElement(Object.values(USER_ACCOUNT_TYPE)),
		).getValue(),
		walletId: new SnowflakeID(),
		wallet: null,
		isDeleted: false,
		deletedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	it("should create a User", () => {
		const user = User.create(mockData);

		expect(user).toBeInstanceOf(User);
		expect(user.id).toBe(mockData.id);
		expect(user.nameValue).toBe(mockData.name.value);
		expect(user.emailValue).toBe(mockData.email.value);
		expect(user.password).toBe(mockData.password);
		expect(user.accountTypeValue).toBe(mockData.accountType.value);
		expect(user.createdAt.toString()).toBe(mockData.createdAt.toString());
		expect(user.updatedAt.toString()).toBe(mockData.updatedAt.toString());
	});
});
