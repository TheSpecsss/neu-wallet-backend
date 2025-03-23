import { inputObjectType, nonNull, objectType } from "nexus";

export default [
	objectType({
		name: "AuditLogChange",
		definition(t) {
			t.nonNull.string("key");
			t.nonNull.list.field("values", { type: nonNull("AuditLogChangeValue") });
		},
	}),
	objectType({
		name: "AuditLogChangeValue",
		definition(t) {
			t.nonNull.string("from");
			t.nonNull.string("to");
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
