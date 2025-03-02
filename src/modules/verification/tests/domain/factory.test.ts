import { beforeEach, describe, expect, it } from "bun:test";
import { Verification } from "@/modules/verification/src/domain/classes/verification";
import {
	type IVerificationFactory,
	VerificationFactory,
} from "@/modules/verification/src/domain/factory";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { generateVerificationCode } from "@/shared/infrastructure/authentication/generateVerificationCode";
import { faker } from "@faker-js/faker";

describe("VerificationFactory", () => {
	let mockData: IVerificationFactory;

	beforeEach(() => {
		mockData = {
			id: new SnowflakeID().toString(),
			userId: new SnowflakeID().toString(),
			code: generateVerificationCode(),
			status: faker.helpers.arrayElement(Object.values(VERIFICATION_STATUS)),
			expiredAt: new Date(Date.now() + 60 * 60 * 1000),
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	});

	it("should successfully create a Verification when all properties are valid", () => {
		const result = VerificationFactory.create(mockData);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(Verification);

		const user = result.getValue();
		expect(user.idValue).toBe(mockData.id!);
		expect(user.userIdValue).toBe(mockData.userId);
		expect(user.code).toBe(mockData.code);
		expect(user.statusValue).toBe(mockData.status);
		expect(user.expiredAt.toString()).toBe(mockData.expiredAt.toString());
		expect(user.createdAt.toString()).toBe(mockData.createdAt.toString());
		expect(user.updatedAt.toString()).toBe(mockData.updatedAt.toString());
	});

	it("should fail when verification status is invalid status", () => {
		const invalidStatusProps = { ...mockData, status: "invalid-verification-status" };

		const result = VerificationFactory.create(invalidStatusProps);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			`${invalidStatusProps.status} is invalid status of user verification`,
		);
	});
});
