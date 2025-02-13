import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import { objectType } from "nexus";

export const Transaction = objectType({
	name: "Transaction",
	definition(t) {
		t.nonNull.id("id", {
			resolve: (source) => (source as ITransaction).idValue,
		});
		t.nonNull.id("senderId", {
			resolve: (source) => (source as ITransaction).senderIdValue,
		});
		t.nullable.field("sender", {
			type: "User",
			resolve: (source) => (source as ITransaction).sender,
		});
		t.nonNull.id("receiverId", {
			resolve: (source) => (source as ITransaction).receiverIdValue,
		});
		t.nullable.field("receiver", {
			type: "User",
			resolve: (source) => (source as ITransaction).receiver,
		});
		t.nonNull.float("amount", {
			resolve: (source) => (source as ITransaction).amountValue,
		});
		t.nonNull.string("type", {
			resolve: (source) => (source as ITransaction).typeValue,
		});
		t.nonNull.string("createdAt", {
			resolve: (source) => (source as ITransaction).createdAt.toISOString(),
		});
	},
});
