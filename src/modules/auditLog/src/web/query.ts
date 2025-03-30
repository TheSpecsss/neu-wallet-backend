import { GetAuditLogsByPaginationUseCase } from "@/modules/auditLog/src/useCase/getAuditLogsByPaginationUseCase";
import { requireAdminUser } from "@/shared/infrastructure/http/authorization/requireAdminUser";
import { extendType, intArg, nonNull } from "nexus";

export default extendType({
	type: "Query",
	definition(t) {
		t.field("getAuditLogsByPagination", {
			authorize: requireAdminUser,
			type: "AuditLogPagination",
			args: {
				perPage: nonNull(intArg()),
				page: nonNull(intArg()),
			},
			resolve: async (_, { perPage, page }, __) => {
				const useCase = new GetAuditLogsByPaginationUseCase();
				return await useCase.execute({
					perPage,
					page,
				});
			},
		});
	},
});
