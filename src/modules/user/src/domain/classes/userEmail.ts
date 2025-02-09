import { Result } from "@/shared/core/result";

export interface IUserEmail {
	value: string;
}

export class UserEmail implements IUserEmail {
	private readonly _value: string;
	public static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+(\.[a-zA-Z0-9._%+-]+)*@neu\.edu\.ph$/i;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(email: string): Result<UserEmail> {
		if (!UserEmail.EMAIL_REGEX.test(email)) {
			return Result.fail(
				"Invalid email address. Please use a valid NEU email address (e.g., example@neu.edu.ph).",
			);
		}

		return Result.ok(new UserEmail(email));
	}

	public get value(): string {
		return this._value;
	}
}
