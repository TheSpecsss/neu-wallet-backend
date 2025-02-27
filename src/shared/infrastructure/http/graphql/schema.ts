import transactionTypes from "@/modules/transaction/src/web";
import userTypes from "@/modules/user/src/web";
import types from "@/shared/infrastructure/http/graphql/types";
import { makeSchema } from "nexus";

export const schema = makeSchema({
	types: [...types, ...userTypes, ...transactionTypes],
	outputs: {
		schema: `${__dirname}/generated/schema.graphql`,
		typegen: `${__dirname}/generated/types.ts`,
	},
});
