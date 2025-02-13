import type { IWallet } from "@/modules/wallet/src/domain/classes/wallet";
import { objectType } from "nexus";
import { defaultTo } from "rambda";

export const Wallet = objectType({
	name: "Wallet",
	definition(t) {
		t.nonNull.id("id", {
			resolve: (source) => (source as IWallet).idValue,
		});
		t.nullable.field("user", {
			type: "User",
			resolve: (source) => (source as IWallet).user,
		});
		t.nonNull.float("balance", {
			resolve: (source) => (source as IWallet).balanceValue,
		});
		t.nonNull.boolean("isDeleted", {
			resolve: (source) => (source as IWallet).isDeleted,
		});
		t.nullable.string("deletedAt", {
			resolve: (source) => defaultTo(null, (source as IWallet).deletedAt?.toISOString()),
		});
		t.nonNull.string("createdAt", {
			resolve: (source) => (source as IWallet).createdAt.toISOString(),
		});
		t.nonNull.string("updatedAt", {
			resolve: (source) => (source as IWallet).updatedAt.toISOString(),
		});
	},
});
