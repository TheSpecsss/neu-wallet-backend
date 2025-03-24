import { beforeAll, describe, expect, it } from "bun:test";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { seedUser } from "@/modules/user/tests/utils/seedUser";

describe("UserRoleManagementService", () => {
	let service: UserRoleManagementService;

	beforeAll(() => {
		service = new UserRoleManagementService();
	});

	describe("isSuperAdmin", () => {
		it("should return true when user has super admin permission", async () => {
			const user = await seedUser({ accountType: USER_ACCOUNT_TYPE.SUPER_ADMIN });
			const isSuperAdmin = await service.isSuperAdmin(user.id);

			expect(isSuperAdmin).toBe(true);
		});

		it("should return false when user has super admin permission", async () => {
			const user = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
			const isSuperAdmin = await service.isSuperAdmin(user.id);

			expect(isSuperAdmin).toBe(false);
		});
	});

	describe("hasPermission", () => {
		it("should return true when user has the required permission", async () => {
			const user = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
			const hasPermission = await service.hasPermission(user.id, USER_ACCOUNT_TYPE.ADMIN);

			expect(hasPermission).toBe(true);
		});

		it("should return false when user does not have the required permission", async () => {
			const user = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
			const hasPermission = await service.hasPermission(user.id, USER_ACCOUNT_TYPE.ADMIN);

			expect(hasPermission).toBe(false);
		});
	});

	describe("hasHigherPermission", () => {
		it("should return true when the reference user has a higher permission level than the target user", async () => {
			const userOne = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
			const userTwo = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
			const hasHigherPermission = await service.hasHigherPermission(userOne.id, userTwo.id);

			expect(hasHigherPermission).toBe(true);
		});

		it("should return false when reference and target users have the same permission level", async () => {
			const userOne = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
			const userTwo = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
			const hasHigherPermission = await service.hasHigherPermission(userOne.id, userTwo.id);

			expect(hasHigherPermission).toBe(false);
		});

		it("should return false when target user has higher permission than reference user", async () => {
			const userOne = await seedUser({ accountType: USER_ACCOUNT_TYPE.CASHIER });
			const userTwo = await seedUser({ accountType: USER_ACCOUNT_TYPE.ADMIN });
			const hasHigherPermission = await service.hasHigherPermission(userOne.id, userTwo.id);

			expect(hasHigherPermission).toBe(false);
		});
	});

	describe("hasHigherAccountType", () => {
		it("should return true when accountType are higher than targetAccountType", () => {
			const hasHigherAccountType = service.hasHigherAccountType(
				USER_ACCOUNT_TYPE.ADMIN,
				USER_ACCOUNT_TYPE.CASHIER,
			);

			expect(hasHigherAccountType).toBe(true);
		});

		it("should return true when accountType are higher than targetAccountType", () => {
			const hasHigherAccountType = service.hasHigherAccountType(
				USER_ACCOUNT_TYPE.CASH_TOP_UP,
				USER_ACCOUNT_TYPE.ADMIN,
			);

			expect(hasHigherAccountType).toBe(false);
		});
	});

	describe("ensureValidRoleChange", () => {
		it("should allow role change when updater has higher permission", () => {
			expect(() =>
				service.ensureValidRoleChange(USER_ACCOUNT_TYPE.ADMIN, {
					oldRole: USER_ACCOUNT_TYPE.USER,
					newRole: USER_ACCOUNT_TYPE.CASHIER,
				}),
			).not.toThrow();
		});

		it("should throw an error when updating a user with a higher role", () => {
			expect(() =>
				service.ensureValidRoleChange(USER_ACCOUNT_TYPE.ADMIN, {
					oldRole: USER_ACCOUNT_TYPE.SUPER_ADMIN,
					newRole: USER_ACCOUNT_TYPE.USER,
				}),
			).toThrow("Modifying a user with a higher or equal role is restricted");
		});

		it("should throw an error when updating a user with an equal role", () => {
			expect(() =>
				service.ensureValidRoleChange(USER_ACCOUNT_TYPE.ADMIN, {
					oldRole: USER_ACCOUNT_TYPE.ADMIN,
					newRole: USER_ACCOUNT_TYPE.USER,
				}),
			).toThrow("Modifying a user with a higher or equal role is restricted");
		});

		it("should throw an error when assigning a higher role", () => {
			expect(() =>
				service.ensureValidRoleChange(USER_ACCOUNT_TYPE.ADMIN, {
					oldRole: USER_ACCOUNT_TYPE.USER,
					newRole: USER_ACCOUNT_TYPE.SUPER_ADMIN,
				}),
			).toThrow("Assigning a role that is higher or equal to the current role is restricted");
		});

		it("should throw an error when assigning an equal role", () => {
			expect(() =>
				service.ensureValidRoleChange(USER_ACCOUNT_TYPE.ADMIN, {
					oldRole: USER_ACCOUNT_TYPE.USER,
					newRole: USER_ACCOUNT_TYPE.ADMIN,
				}),
			).toThrow("Assigning a role that is higher or equal to the current role is restricted");
		});
	});
});
