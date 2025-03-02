import type { IVerification } from "@/modules/verification/src/domain/classes/verification";
import { objectType } from "nexus";

export const Verification = objectType({
	name: "Verification",
	definition(t) {
		t.nonNull.id("id", {
			resolve: (source) => (source as IVerification).idValue,
		});
		t.nonNull.id("userId", {
			resolve: (source) => (source as IVerification).userIdValue,
		});
		t.nullable.field("user", {
			type: "User",
			resolve: (source) => (source as IVerification).user,
		});
		t.nonNull.string("code", {
			resolve: (source) => (source as IVerification).code,
		});
		t.nonNull.string("status", {
			resolve: (source) => (source as IVerification).statusValue,
		});
		t.nonNull.string("expiredAt", {
			resolve: (source) => (source as IVerification).expiredAt.toISOString(),
		});
		t.nonNull.string("createdAt", {
			resolve: (source) => (source as IVerification).createdAt.toISOString(),
		});
		t.nonNull.string("updatedAt", {
			resolve: (source) => (source as IVerification).updatedAt.toISOString(),
		});
	},
});
