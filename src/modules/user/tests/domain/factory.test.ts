import { beforeEach, describe, expect, it } from "bun:test";
import { User } from "@/modules/user/src/domain/classes/user";
import { UserName } from "@/modules/user/src/domain/classes/userName";
import { type IUserFactory, UserFactory } from "@/modules/user/src/domain/factory";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { faker } from "@faker-js/faker";

describe("UserFactory", () => {
	let mockData: IUserFactory;

	beforeEach(() => {
		mockData = {
			id: new SnowflakeID().toString(),
			name: faker.string.sample({
				min: UserName.MINIMUM_USERNAME_LENGTH,
				max: UserName.MAXIMUM_USERNAME_LENGTH,
			}),
			email: faker.internet.email({ provider: "neu.edu.ph" }),
			password: faker.internet.password(),
			accountType: faker.helpers.arrayElement(Object.values(USER_ACCOUNT_TYPE)),
			wallet: null,
			sentTransactions: [],
			receivedTransactions: [],
			isDeleted: false,
			isVerified: false,
			deletedAt: null,
			createdAt: faker.date.past(),
			updatedAt: faker.date.past(),
		};
	});

	it("should successfully create a User when all properties are valid", () => {
		const result = UserFactory.create(mockData);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(User);

		const user = result.getValue();
		expect(user.idValue).toBe(mockData.id!);
		expect(user.nameValue).toBe(mockData.name);
		expect(user.emailValue).toBe(mockData.email);
		expect(user.password).toBe(mockData.password);
		expect(user.accountTypeValue).toBe(mockData.accountType);
		expect(user.createdAt.toString()).toBe(mockData.createdAt.toString());
		expect(user.updatedAt.toString()).toBe(mockData.updatedAt.toString());
	});

	it("should fail if name is greater than the maximum value", () => {
		const invalidNameProps = {
			...mockData,
			name: faker.string.sample({
				min: UserName.MAXIMUM_USERNAME_LENGTH + 1,
				max: UserName.MAXIMUM_USERNAME_LENGTH + 1,
			}),
		};

		const result = UserFactory.create(invalidNameProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`Name is limited to ${UserName.MAXIMUM_USERNAME_LENGTH} characters long`,
		);
	});

	it("should fail if name is less than the minimum value", () => {
		const invalidNameProps = {
			...mockData,
			name: faker.string.sample({
				min: UserName.MINIMUM_USERNAME_LENGTH - 1,
				max: UserName.MINIMUM_USERNAME_LENGTH - 1,
			}),
		};

		const result = UserFactory.create(invalidNameProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`Name must be at least ${UserName.MINIMUM_USERNAME_LENGTH} characters long`,
		);
	});

	it("should fail when email is not an NEU email address", () => {
		const invalidEmailProps = {
			...mockData,
			email: faker.internet.email({ provider: "gmail.com" }),
		};

		const result = UserFactory.create(invalidEmailProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			"Invalid email address. Please use a valid NEU email address (e.g., example@neu.edu.ph).",
		);
	});

	it("should fail when accountType is invalid type", () => {
		const invalidAccountTypeProps = { ...mockData, accountType: "STUDENT" };

		const result = UserFactory.create(invalidAccountTypeProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`${invalidAccountTypeProps.accountType} is invalid user account type`,
		);
	});
});
