export class UnauthorizedError extends Error {
	constructor(message = "Invalid Authentication Token") {
		super(message);
		this.name = "Unauthorized";

		Error.captureStackTrace(this, this.constructor);
	}
}

export class UnverifiedUserError extends Error {
	constructor(message = "User is not verified") {
		super(message);
		this.name = "UnverifiedUser";

		Error.captureStackTrace(this, this.constructor);
	}
}

export class NoAdminPermissionError extends Error {
	constructor(message = "User does not have admin permission") {
		super(message);
		this.name = "NoAdminPermission";

		Error.captureStackTrace(this, this.constructor);
	}
}
