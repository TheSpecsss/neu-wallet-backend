import { inputObjectType, objectType } from "nexus";

export default [
	objectType({
		name: "AuditLogChange",
		definition(t) {
			t.string("key");
			t.list.field("values", { type: "AuditLogChangeValue" });
		},
	}),
	objectType({
		name: "AuditLogChangeValue",
		definition(t) {
			t.string("from");
			t.string("to");
		},
	}),
	inputObjectType({
		name: "AuditLogHydrateOption",
		definition(t) {
			t.nonNull.boolean("executor");
			t.nonNull.boolean("target");
		},
	}),
];
