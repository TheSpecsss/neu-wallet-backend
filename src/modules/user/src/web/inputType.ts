import { inputObjectType, nonNull, objectType } from "nexus";

export default [
	objectType({
		name: "Login",
		definition(t) {
			t.nonNull.string("token");
			t.nonNull.string("expiresAt");
		},
	}),
	objectType({
		name: "UserBalance",
		definition(t) {
			t.nonNull.float("balance");
		},
	}),
	objectType({
		name: "UserPagination",
		definition(t) {
			t.nonNull.list.field("users", { type: nonNull("User") });
			t.nonNull.boolean("hasNextPage");
			t.nonNull.boolean("hasPreviousPage");
			t.nonNull.int("page");
			t.nonNull.int("totalPages");
		},
	}),
	inputObjectType({
		name: "UserHydrateOption",
		definition(t) {
			t.nonNull.boolean("wallet");
			t.nonNull.boolean("sentTransactions");
			t.nonNull.boolean("receivedTransactions");
		},
	}),
];
