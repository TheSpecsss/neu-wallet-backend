import { inputObjectType } from "nexus";

export default [
	inputObjectType({
		name: "WalletHydrateOption",
		definition(t) {
			t.nonNull.boolean("sender");
			t.nonNull.boolean("receiver");
		},
	}),
];
