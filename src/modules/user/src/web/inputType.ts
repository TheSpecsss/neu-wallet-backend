import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { enumType, inputObjectType, nonNull, objectType } from "nexus";

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
			t.nonNull.list.nonNull.field("users", { type: nonNull("User") });
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
	enumType({
		name: "UserAccountType",
		members: Object.keys(USER_ACCOUNT_TYPE),
	}),
];
