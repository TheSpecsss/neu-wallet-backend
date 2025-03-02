import {
	type IVerificationRawObject,
	VERIFICATION_STATUS,
} from "@/modules/verification/src/domain/shared/constant";
import { SnowflakeID } from "@/shared/domain/snowflakeId";
import { generateVerificationCode } from "@/shared/infrastructure/authentication/generateVerificationCode";
import { db } from "@/shared/infrastructure/database";
import { faker } from "@faker-js/faker";

export const seedVerification = async (
	partialSchemaObject: Partial<IVerificationRawObject> = {},
): Promise<IVerificationRawObject> => {
	const defaultSchemaObject = {
		id: new SnowflakeID().toString(),
		userId: new SnowflakeID().toString(),
		code: generateVerificationCode(),
		status: faker.helpers.arrayElement(Object.values(VERIFICATION_STATUS)),
		expiredAt: new Date(Date.now() + 60 * 60 * 1000),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	return await db.userVerification.create({
		data: { ...defaultSchemaObject, ...partialSchemaObject },
	});
};
