import { inputObjectType, objectType } from "nexus";

export default [
	inputObjectType({
		name: "WalletHydrateOption",
		definition(t) {
			t.nonNull.boolean("sender");
			t.nonNull.boolean("receiver");
		},
	}),
	objectType({
		name: "WalletTransfer",
		definition(t) {
			t.nonNull.field("senderWallet", { type: "Wallet" });
			t.nonNull.field("receiverWallet", { type: "Wallet" });
		},
	}),
];
