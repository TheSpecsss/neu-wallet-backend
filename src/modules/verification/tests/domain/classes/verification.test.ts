import { describe, expect, it } from "bun:test";
import { Verification } from "@/modules/verification/src/domain/classes/verification";
import { VerificationStatus } from "@/modules/verification/src/domain/classes/verificationStatus";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { generateVerificationCode } from "@/shared/infrastructure/authentication/generateVerificationCode";
import { faker } from "@faker-js/faker";

describe("Verification", () => {
	const mockData = {
		id: new SnowflakeID(),
		userId: new SnowflakeID(),
		user: null,
		code: generateVerificationCode(),
		status: VerificationStatus.create(
			faker.helpers.arrayElement(Object.values(VERIFICATION_STATUS)),
		).getValue(),
		expiredAt: new Date(Date.now() + 60 * 60 * 1000),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	it("should create a Verification", () => {
		const verification = Verification.create(mockData);

		expect(verification).toBeInstanceOf(Verification);
		expect(verification.id).toBe(mockData.id);
		expect(verification.userId).toBe(mockData.userId);
		expect(verification.user).toBe(mockData.user);
		expect(verification.code).toBe(mockData.code);
		expect(verification.status).toBe(mockData.status);
		expect(verification.expiredAt.toString()).toBe(mockData.expiredAt.toString());
		expect(verification.createdAt.toString()).toBe(mockData.createdAt.toString());
		expect(verification.updatedAt.toString()).toBe(mockData.updatedAt.toString());
	});
});
