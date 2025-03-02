import type { IVerification } from "@/modules/verification/src/domain/classes/verification";
import { VerificationFactory } from "@/modules/verification/src/domain/factory";
import {
	type IVerificationRawObject,
	VERIFICATION_STATUS,
} from "@/modules/verification/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { generateVerificationCode } from "@/shared/infrastructure/authentication/generateVerificationCode";
import { faker } from "@faker-js/faker";

export const createVerificationDomainObject = (
	partialDomainObject: Partial<IVerificationRawObject> = {},
): IVerification => {
	const defaultDomainObject = {
		id: new SnowflakeID().toString(),
		userId: new SnowflakeID().toString(),
		code: generateVerificationCode(),
		status: faker.helpers.arrayElement(Object.values(VERIFICATION_STATUS)),
		expiredAt: new Date(Date.now() + 60 * 60 * 1000),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return VerificationFactory.create({
		...defaultDomainObject,
		...partialDomainObject,
	}).getValue();
};
