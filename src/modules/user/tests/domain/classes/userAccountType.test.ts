import { describe, expect, it } from "bun:test";
import { UserAccountType } from "@/modules/user/src/domain/classes/userAccountType";

describe("UserAccountType", () => {
	it("should successfully create a UserAccountType instance with a valid account type", () => {
		const result = UserAccountType.create("USER");

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(UserAccountType);
		expect(result.getValue().value).toBe("USER");
	});

	it("should return an error when creating a UserAccountType with an invalid account type", () => {
		const result = UserAccountType.create("STUDENT");

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe("STUDENT is invalid user account type");
	});
});
