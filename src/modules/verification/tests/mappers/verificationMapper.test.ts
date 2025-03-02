import { describe, expect, it } from "bun:test";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { Verification } from "@/modules/verification/src/domain/classes/verification";
import { VerificationMapper } from "@/modules/verification/src/mappers/verificationMapper";
import { createVerificationDomainObject } from "@/modules/verification/tests/utils/createVerificationDomainObject";
import { seedVerification } from "@/modules/verification/tests/utils/seedVerification";

describe("VerificationMapper", () => {
	it("should map to domain from persistence data", async () => {
		const user = await seedUser();

		const schemaObject = await seedVerification({ userId: user.id });
		const domainObject = VerificationMapper.toDomain(schemaObject);

		expect(domainObject).toBeInstanceOf(Verification);
		expect(domainObject.idValue).toBe(schemaObject.id);
		expect(domainObject.userIdValue).toBe(schemaObject.userId);
		expect(domainObject.code).toBe(schemaObject.code);
		expect(domainObject.statusValue).toBe(schemaObject.status);
		expect(domainObject.expiredAt.toString()).toBe(schemaObject.expiredAt.toString());
		expect(domainObject.createdAt.toString()).toBe(schemaObject.createdAt.toString());
		expect(domainObject.updatedAt.toString()).toBe(schemaObject.updatedAt.toString());
	});

	it("should map to persistence from domain", async () => {
		const domainObject = createVerificationDomainObject();
		const schemaObject = VerificationMapper.toPersistence(domainObject);

		expect(schemaObject.id).toBe(domainObject.idValue);
		expect(schemaObject.userId).toBe(domainObject.userIdValue);
		expect(schemaObject.code).toBe(domainObject.code);
		expect(schemaObject.status).toBe(domainObject.statusValue);
		expect(schemaObject.expiredAt.toString()).toBe(domainObject.expiredAt.toString());
	});
});
