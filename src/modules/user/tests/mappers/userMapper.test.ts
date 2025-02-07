import { describe, expect, it } from "bun:test";
import { User } from "@/modules/user/src/domain/classes/user";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import { createUserDomainObject } from "@/modules/user/tests/utils/createUserDomainObject";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { seedWallet } from "@/modules/wallet/tests/utils/seedWallet";

describe("UserMapper", () => {
	it("should map to domain from persistence data", async () => {
		const walletSchemaObject = await seedWallet();
		const userSchemaObject = await seedUser({ walletId: walletSchemaObject.id });
		const userDomainObject = UserMapper.toDomain(userSchemaObject);

		expect(userDomainObject).toBeInstanceOf(User);
		expect(userDomainObject.idValue).toBe(userSchemaObject.id);
		expect(userDomainObject.nameValue).toBe(userSchemaObject.name);
		expect(userDomainObject.emailValue).toBe(userSchemaObject.email);
		expect(userDomainObject.password).toBe(userSchemaObject.password);
		expect(userDomainObject.accountTypeValue).toBe(userSchemaObject.accountType);
		expect(userDomainObject.walletIdValue).toBe(userSchemaObject.walletId);
		expect(userDomainObject.isDeleted).toBe(userSchemaObject.isDeleted);
	});

	it("should map to persistence from domain", async () => {
		const userDomainObject = createUserDomainObject();
		const userSchemaObject = UserMapper.toPersistence(userDomainObject);

		expect(userSchemaObject.id).toBe(userDomainObject.idValue);
		expect(userSchemaObject.name).toBe(userDomainObject.nameValue);
		expect(userSchemaObject.email).toBe(userDomainObject.emailValue);
		expect(userSchemaObject.password).toBe(userDomainObject.password);
		expect(userSchemaObject.accountType).toBe(userDomainObject.accountTypeValue);
		expect(userSchemaObject.walletId).toBe(userDomainObject.walletIdValue);
		expect(userSchemaObject.isDeleted).toBe(userDomainObject.isDeleted);
	});
});
