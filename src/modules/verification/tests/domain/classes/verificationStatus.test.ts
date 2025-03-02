import { describe, expect, it } from "bun:test";
import { VerificationStatus } from "@/modules/verification/src/domain/classes/verificationStatus";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import { faker } from "@faker-js/faker";

describe("VerificationStatus", () => {
	it("should successfully create a VerificationStatus instance with a valid type", () => {
		const status = faker.helpers.arrayElement(Object.values(VERIFICATION_STATUS));
		const result = VerificationStatus.create(status);

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(VerificationStatus);
		expect(result.getValue().value).toBe(status);
	});

	it("should return an error when creating a VerificationStatus with an invalid status", () => {
		const status = "invalid-verification-status";
		const result = VerificationStatus.create(status);

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(`${status} is invalid status of user verification`);
	});
});
