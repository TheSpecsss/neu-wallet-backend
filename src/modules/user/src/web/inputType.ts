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
	inputObjectType({
		name: "UserHydrateOption",
		definition(t) {
			t.nonNull.boolean("wallet");
			t.nonNull.boolean("sentTransactions");
			t.nonNull.boolean("receivedTransactions");
		},
	}),
];
