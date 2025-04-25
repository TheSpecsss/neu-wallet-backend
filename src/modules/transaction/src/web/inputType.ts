import { inputObjectType, nonNull, objectType } from "nexus";

export default [
	objectType({
		name: "TransactionsWithPagination",
		definition(t) {
			t.nonNull.list.field("transactions", { type: nonNull("Transaction") });
			t.nonNull.boolean("hasNextPage");
			t.nonNull.boolean("hasPreviousPage");
			t.nonNull.int("page");
			t.nonNull.int("totalPages");
		},
	}),
	inputObjectType({
		name: "TransactionHydrateOption",
		definition(t) {
			t.nonNull.boolean("sender");
			t.nonNull.boolean("receiver");
		},
	}),
];
