import { describe, expect, it } from "bun:test";
import { UserEmail } from "@/modules/user/src/domain/classes/userEmail";

describe("UserEmail", () => {
	it("should successfully create a UserEmail instance with a valid NEU email address", () => {
		const result = UserEmail.create("example.email@neu.edu.ph");

		expect(result.isSuccess).toBe(true);
		expect(result.isFailure).toBe(false);
		expect(result.getValue()).toBeInstanceOf(UserEmail);
		expect(result.getValue().value).toBe("example.email@neu.edu.ph");
	});

	it("should return an error when creating a UserEmail with non NEU email address", () => {
		const result = UserEmail.create("example.email@gmail.com");

		expect(result.isSuccess).toBe(false);
		expect(result.isFailure).toBe(true);
		expect(result.getErrorMessage()).toBe(
			"Invalid email address. Please use a valid NEU email address (e.g., example@neu.edu.ph).",
		);
	});
});
