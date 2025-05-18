import auditLogTypes from "@/modules/auditLog/src/web";
import transactionTypes from "@/modules/transaction/src/web";
import userTypes from "@/modules/user/src/web";
import verificationTypes from "@/modules/verification/src/web";
import walletTypes from "@/modules/wallet/src/web";
import types from "@/shared/infrastructure/http/graphql/types";
import { DateTimeResolver } from "graphql-scalars";
import { asNexusMethod, fieldAuthorizePlugin, makeSchema } from "nexus";

export const schema = makeSchema({
	types: [
		...types,
		...auditLogTypes,
		...transactionTypes,
		...userTypes,
		...verificationTypes,
		...walletTypes,
		asNexusMethod(DateTimeResolver, "date"),
	],
	outputs: {
		schema: `${__dirname}/generated/schema.graphql`,
		typegen: `${__dirname}/generated/types.ts`,
	},
	plugins: [
		fieldAuthorizePlugin({
			formatError: ({ error }) => {
				return error ?? new Error("Not authorized");
			},
		}),
	],
});
