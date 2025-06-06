import type { IUser } from "@/modules/user/src/domain/classes/user";
import { nonNull, objectType } from "nexus";
import { defaultTo } from "rambda";

export const User = objectType({
	name: "User",
	definition(t) {
		t.nonNull.string("id", {
			resolve: (source) => (source as IUser).idValue,
		});
		t.nonNull.string("name", {
			resolve: (source) => (source as IUser).nameValue,
		});
		t.nonNull.string("email", {
			resolve: (source) => (source as IUser).emailValue,
		});
		t.nonNull.string("accountType", {
			resolve: (source) => (source as IUser).accountTypeValue,
		});
		t.nullable.field("wallet", {
			type: "Wallet",
			resolve: (source) => (source as IUser).wallet,
		});
		t.nonNull.list.nonNull.field("sentTransactions", {
			type: nonNull("Transaction"),
			resolve: (source) => (source as IUser).sentTransactions,
		});
		t.nonNull.list.nonNull.field("receivedTransactions", {
			type: nonNull("Transaction"),
			resolve: (source) => (source as IUser).receivedTransactions,
		});
		t.nonNull.boolean("isDeleted", {
			resolve: (source) => (source as IUser).isDeleted,
		});
		t.nullable.string("deletedAt", {
			resolve: (source) => defaultTo(null, (source as IUser).deletedAt?.toISOString()),
		});
		t.nonNull.string("createdAt", {
			resolve: (source) => (source as IUser).createdAt.toISOString(),
		});
		t.nonNull.string("updatedAt", {
			resolve: (source) => (source as IUser).updatedAt.toISOString(),
		});
	},
});
