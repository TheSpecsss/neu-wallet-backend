import { inputObjectType, objectType } from "nexus";

export default [
	objectType({
		name: "Login",
		definition(t) {
			t.string("token");
		},
	}),
	objectType({
		name: "UserBalance",
		definition(t) {
			t.float("balance");
		},
	}),
	objectType({
		name: "UserPagination",
		definition(t) {
			t.list.field("users", { type: "User" });
			t.boolean("hasNextPage");
			t.boolean("hasPreviousPage");
			t.int("page");
			t.int("totalPages");
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
