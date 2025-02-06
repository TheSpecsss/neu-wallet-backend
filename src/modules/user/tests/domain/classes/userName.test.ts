import { describe, expect, it } from "bun:test";
import { UserName } from "@/modules/user/src/domain/classes/userName";
import { faker } from "@faker-js/faker";

describe("UserName", () => {
	it("should create a valid UserName instance with a username less than the maximum allowed length", () => {
		const name = faker.string.sample({
			min: UserName.MINIMUM_USERNAME_LENGTH,
			max: UserName.MAXIMUM_USERNAME_LENGTH - 1,
		});

		const result = UserName.create(name);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(UserName);
		expect(result.getValue().value).toBe(name);
	});

	it("should create a UserName instance when the username length is exactly maximum allowed length", () => {
		const name = faker.string.sample({
			min: UserName.MAXIMUM_USERNAME_LENGTH,
			max: UserName.MAXIMUM_USERNAME_LENGTH,
		});

		const result = UserName.create(name);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(UserName);
		expect(result.getValue().value).toBe(name);
	});

	it("should return an error when creating a UserName with a value exceeding the maximum allowed length", () => {
		const name = faker.string.sample({
			min: UserName.MAXIMUM_USERNAME_LENGTH + 1,
			max: UserName.MAXIMUM_USERNAME_LENGTH + 1,
		});

		const result = UserName.create(name);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`Name is limited to ${UserName.MAXIMUM_USERNAME_LENGTH} characters long`,
		);
	});

	it("should return an error when creating a UserName with a value below the minimum allowed length", () => {
		const name = faker.string.sample({
			min: UserName.MINIMUM_USERNAME_LENGTH - 1,
			max: UserName.MINIMUM_USERNAME_LENGTH - 1,
		});

		const result = UserName.create(name);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`Name must be at least ${UserName.MINIMUM_USERNAME_LENGTH} characters long`,
		);
	});
});
