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
	objectType({
		name: "AuditLogPagination",
		definition(t) {
			t.nonNull.list.field("auditLogs", { type: nonNull("AuditLog") });
			t.nonNull.boolean("hasNextPage");
			t.nonNull.boolean("hasPreviousPage");
			t.nonNull.int("page");
			t.nonNull.int("totalPages");
		},
	}),
];
