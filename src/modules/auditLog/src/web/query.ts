import type { ActionTypeKind } from "@/modules/auditLog/src/domain/shared/constant";
import { GetAuditLogsByFilterAndPaginationUseCase } from "@/modules/auditLog/src/useCase/getAuditLogsByFilterAndPaginationUseCase";
import { GetAuditLogsByPaginationUseCase } from "@/modules/auditLog/src/useCase/getAuditLogsByPaginationUseCase";
import { requireAdminUser } from "@/shared/infrastructure/http/authorization/requireAdminUser";
import { requireVerifiedUser } from "@/shared/infrastructure/http/authorization/requireVerifiedUser";
import { extendType, intArg, nonNull, nullable } from "nexus";
import { defaultTo } from "rambda";

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
		t.field("getAuditLogsByFilterAndPagination", {
			authorize: requireVerifiedUser,
			type: "AuditLogPagination",
			args: {
				perPage: nonNull(intArg()),
				page: nonNull(intArg()),
				hydrate: nullable("AuditLogHydrateOption"),
				orderBy: nullable("OrderBy"),
				filter: nullable("AuditLogFilter"),
			},
			resolve: async (_, { perPage, page, hydrate, orderBy, filter }, ctx) => {
				const useCase = new GetAuditLogsByFilterAndPaginationUseCase();
				return await useCase.execute({
					perPage,
					page,
					userId: ctx.user.idValue,
					hydrate: defaultTo(undefined, hydrate),
					orderBy: defaultTo(undefined, orderBy),
					filter: defaultTo(undefined, {
						startDate: filter?.startDate,
						endDate: filter?.endDate,
						actionTypes: filter?.actionTypes as ActionTypeKind[] | undefined,
						id: filter?.id as string | undefined,
						name: filter?.name as string | undefined,
						email: filter?.email as string | undefined,
					}),
				});
			},
		});
	},
});
