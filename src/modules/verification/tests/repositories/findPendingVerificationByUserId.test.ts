import { beforeAll, describe, expect, it } from "bun:test";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import type { IVerification } from "@/modules/verification/src/domain/classes/verification";
import {
	type IVerificationRawObject,
	VERIFICATION_STATUS,
} from "@/modules/verification/src/domain/shared/constant";
import {
	type IVerificationRepository,
	VerificationRepository,
} from "@/modules/verification/src/repositories/verificationRepository";
import { seedVerification } from "@/modules/verification/tests/utils/seedVerification";

const assertVerification = (value: IVerification | null, expectedValue: IVerificationRawObject) => {
	expect(value!.idValue).toBe(expectedValue.id);
	expect(value!.userIdValue).toBe(expectedValue.userId);
	expect(value!.code).toBe(expectedValue.code);
	expect(value!.statusValue).toBe(expectedValue.status);
	expect(value!.expiredAt.toString()).toBe(expectedValue.expiredAt.toString());
};

describe("VerificationRepository findPendingVerificationByUserId", () => {
	let verificationRepository: IVerificationRepository;

	beforeAll(async () => {
		verificationRepository = new VerificationRepository();
	});

	it("should retrieve existing user verification found by userId", async () => {
		const seededUser = await seedUser();
		const seededVerification = await seedVerification({
			userId: seededUser.id,
			status: VERIFICATION_STATUS.PENDING,
		});

		const verification = await verificationRepository.findPendingVerificationByUserId(
			seededUser.id,
		);

		assertVerification(verification, seededVerification);
	});

	it("should return null when given non-existing userId", async () => {
		const verification =
			await verificationRepository.findPendingVerificationByUserId("not-a-user-id");

		expect(verification).toBeNull();
	});
});
