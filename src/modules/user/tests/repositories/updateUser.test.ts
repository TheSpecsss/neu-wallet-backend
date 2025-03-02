import { beforeAll, describe, expect, it } from "bun:test";
import { UserName } from "@/modules/user/src/domain/classes/userName";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { UserMapper } from "@/modules/user/src/mappers/userMapper";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { createUserDomainObject } from "@/modules/user/tests/utils/createUserDomainObject";
import { seedUser } from "@/modules/user/tests/utils/seedUser";
import { faker } from "@faker-js/faker";

describe("UserRepository updateUser", () => {
	let userRepository: IUserRepository;

	beforeAll(() => {
		userRepository = new UserRepository();
	});

	it("should update user properties", async () => {
		const seededUser = await seedUser();

		const newData = {
			name: faker.string.sample({
				min: UserName.MINIMUM_USERNAME_LENGTH,
				max: UserName.MAXIMUM_USERNAME_LENGTH,
			}),
			email: faker.internet.email({ provider: "neu.edu.ph" }),
			password: faker.internet.password(),
			accountType: faker.helpers.arrayElement(Object.values(USER_ACCOUNT_TYPE)),
		};

		const userDomainObject = UserMapper.toDomain({ ...seededUser, ...newData });

		const updatedUser = await userRepository.updateUser(userDomainObject);

		expect(updatedUser!.idValue).toBe(seededUser.id);
		expect(updatedUser!.nameValue).toBe(newData.name);
		expect(updatedUser!.emailValue).toBe(newData.email);
		expect(updatedUser!.password).toBe(newData.password);
		expect(updatedUser!.accountTypeValue).toBe(newData.accountType);
	});

	it("should return null when trying to update non-existing user", async () => {
		const userDomainObject = createUserDomainObject();
		const user = await userRepository.updateUser(userDomainObject);

		expect(user).toBeNull();
	});
});
