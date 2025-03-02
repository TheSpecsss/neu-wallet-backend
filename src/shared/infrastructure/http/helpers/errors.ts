export class UnauthorizedError extends Error {
	constructor(
		message = "Invalid Authentication Token",
		public readonly statusCode: number = 401,
	) {
		super(message);
		this.name = "UNAUTHORIZED";
	}
}

export class UnverifiedUserError extends Error {
	constructor(
		message = "User is not verified",
		public readonly statusCode: number = 403,
	) {
		super(message);
		this.name = "UNVERIFIED_USER";
	}
}
