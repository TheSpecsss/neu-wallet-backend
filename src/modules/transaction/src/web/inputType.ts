import { inputObjectType, objectType } from "nexus";

export default [
	objectType({
		name: "TransactionByUserIdWithPagination",
		definition(t) {
			t.list.field("transactions", { type: "Transaction" });
			t.boolean("hasNextPage");
			t.boolean("hasPreviousPage");
			t.int("page");
			t.int("totalPages");
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
