import transactionTypes from "@/modules/transaction/src/web";
import userTypes from "@/modules/user/src/web";
import verificationTypes from "@/modules/verification/src/web";
import types from "@/shared/infrastructure/http/graphql/types";
import { fieldAuthorizePlugin, makeSchema } from "nexus";

export const schema = makeSchema({
	types: [...types, ...transactionTypes, ...userTypes, ...verificationTypes],
	outputs: {
		schema: `${__dirname}/generated/schema.graphql`,
		typegen: `${__dirname}/generated/types.ts`,
	},
	plugins: [fieldAuthorizePlugin()],
});
