import type { IAuditLog } from "@/modules/auditLog/src/domain/classes/auditLog";
import { nonNull, objectType } from "nexus";

export const AuditLog = objectType({
	name: "AuditLog",
	definition(t) {
		t.nonNull.id("id", {
			resolve: (source) => (source as IAuditLog).idValue,
		});
		t.nonNull.id("executorId", {
			resolve: (source) => (source as IAuditLog).executorIdValue,
		});
		t.nullable.field("executor", {
			type: nonNull("User"),
			resolve: (source) => (source as IAuditLog).executor,
		});
		t.nonNull.id("targetId", {
			resolve: (source) => (source as IAuditLog).targetIdValue,
		});
		t.nullable.field("target", {
			type: nonNull("User"),
			resolve: (source) => (source as IAuditLog).target,
		});
		t.nonNull.string("actionType", {
			resolve: (source) => (source as IAuditLog).actionTypeValue,
		});
		t.list.field("changes", {
			type: nonNull("AuditLogChange"),
			resolve: (source) => (source as IAuditLog).changes,
		});
		t.nonNull.string("createdAt", {
			resolve: (source) => (source as IAuditLog).createdAt.toISOString(),
		});
	},
});
