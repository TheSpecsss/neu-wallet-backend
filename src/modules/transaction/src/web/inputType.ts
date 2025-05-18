import {
	TRANSACTION_STATUS,
	TRANSACTION_TYPE,
} from "@/modules/transaction/src/domain/shared/constant";
import { enumType, inputObjectType, nonNull, objectType } from "nexus";

export default [
	objectType({
		name: "TransactionsWithPagination",
		definition(t) {
			t.nonNull.list.nonNull.field("transactions", { type: nonNull("Transaction") });
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
	enumType({
		name: "TransactionType",
		members: Object.keys(TRANSACTION_TYPE),
	}),
	enumType({
		name: "TransactionStatus",
		members: Object.keys(TRANSACTION_STATUS),
	}),
	inputObjectType({
		name: "TransactionFilter",
		definition(t) {
			t.nullable.field("startDate", { type: "DateTime" });
			t.nullable.field("endDate", { type: "DateTime" });
			t.nullable.list.nonNull.field("types", { type: "TransactionType" });
			t.nullable.list.nonNull.field("accountTypes", { type: "UserAccountType" });
			t.nullable.list.nonNull.field("status", { type: "TransactionStatus" });
			t.nullable.string("id");
			t.nullable.string("name");
			t.nullable.string("email");
		},
	}),
];
