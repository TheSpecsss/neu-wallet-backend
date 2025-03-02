import { beforeAll, describe, expect, it } from "bun:test";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { VERIFICATION_STATUS } from "@/modules/verification/src/domain/shared/constant";
import { VerificationMapper } from "@/modules/verification/src/mappers/verificationMapper";
import {
	type IVerificationRepository,
	VerificationRepository,
} from "@/modules/verification/src/repositories/verificationRepository";
import { createVerificationDomainObject } from "@/modules/verification/tests/utils/createVerificationDomainObject";
import { seedVerification } from "@/modules/verification/tests/utils/seedVerification";
import { generateVerificationCode } from "@/shared/infrastructure/authentication/generateVerificationCode";
import { faker } from "@faker-js/faker";

describe("VerificationRepository updateVerification", () => {
	let verificationRepository: IVerificationRepository;

	beforeAll(() => {
		verificationRepository = new VerificationRepository();
	});

	it("should update verification properties", async () => {
		const seededUser = await seedUser();
		const seededVerification = await seedVerification({ userId: seededUser.id });

		const newData = {
			code: generateVerificationCode(),
			status: faker.helpers.arrayElement(Object.values(VERIFICATION_STATUS)),
			expiredAt: new Date(Date.now() + 60 * 60 * 1000),
		};

		const verificationDomainObject = VerificationMapper.toDomain({
			...seededVerification,
			...newData,
		});

		const updatedVerification =
			await verificationRepository.updateVerification(verificationDomainObject);

		expect(updatedVerification!.idValue).toBe(seededVerification.id);
		expect(updatedVerification!.code).toBe(newData.code);
		expect(updatedVerification!.statusValue).toBe(newData.status);
		expect(updatedVerification!.expiredAt.toString()).toBe(newData.expiredAt.toString());
	});

	it("should return null when trying to update non-existing user verification", async () => {
		const verificationDomainObject = createVerificationDomainObject();
		const verification = await verificationRepository.updateVerification(verificationDomainObject);

		expect(verification).toBeNull();
	});
});
