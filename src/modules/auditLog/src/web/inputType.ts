import { ACTION_TYPE } from "@/modules/auditLog/src/domain/shared/constant";
import { enumType, inputObjectType, nonNull, objectType } from "nexus";

export default [
	objectType({
		name: "AuditLogChange",
		definition(t) {
			t.nonNull.string("key");
			t.nonNull.list.nonNull.field("values", { type: nonNull("AuditLogChangeValue") });
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
			t.nonNull.list.nonNull.field("auditLogs", { type: nonNull("AuditLog") });
			t.nonNull.boolean("hasNextPage");
			t.nonNull.boolean("hasPreviousPage");
			t.nonNull.int("page");
			t.nonNull.int("totalPages");
		},
	}),
	enumType({
		name: "AuditLogActionType",
		members: Object.keys(ACTION_TYPE),
	}),
	inputObjectType({
		name: "AuditLogFilter",
		definition(t) {
			t.nullable.field("startDate", { type: "DateTime" });
			t.nullable.field("endDate", { type: "DateTime" });
			t.nullable.list.nonNull.field("actionTypes", { type: "AuditLogActionType" });
			t.nullable.string("id");
			t.nullable.string("name");
			t.nullable.string("email");
		},
	}),
];
