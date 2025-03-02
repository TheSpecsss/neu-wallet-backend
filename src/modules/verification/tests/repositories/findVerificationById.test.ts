import { beforeAll, describe, expect, it } from "bun:test";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import type { IVerification } from "@/modules/verification/src/domain/classes/verification";
import type { IVerificationRawObject } from "@/modules/verification/src/domain/shared/constant";
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

describe("VerificationRepository findVerificationById", () => {
	let verificationRepository: IVerificationRepository;

	beforeAll(async () => {
		verificationRepository = new VerificationRepository();
	});

	it("should retrieve existing user verification found by Id", async () => {
		const seededUser = await seedUser();
		const seededVerification = await seedVerification({ userId: seededUser.id });

		const verification = await verificationRepository.findVerificationById(
			seededVerification.id,
		);

		assertVerification(verification, seededVerification);
	});

	it("should hydrate wallet in the users", async () => {
		const seededUser = await seedUser();
		const seededVerification = await seedVerification({ userId: seededUser.id });

		const verification = await verificationRepository.findVerificationById(seededVerification.id, {
			user: true,
		});

		assertVerification(verification, seededVerification);
		expect(verification!.user!.idValue).toBe(seededUser.id);
	});

	it("should return null when given non-existing user verification id", async () => {
		const verification = await verificationRepository.findVerificationById(
			"not-a-user-verification-id",
		);

		expect(verification).toBeNull();
	});
});
