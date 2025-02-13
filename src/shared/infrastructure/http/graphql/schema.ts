import types from "@/shared/infrastructure/http/graphql/types";
import { makeSchema } from "nexus";

export const schema = makeSchema({
	types,
	outputs: {
		schema: `${__dirname}/generated/schema.graphql`,
		typegen: `${__dirname}/generated/types.ts`,
	},
});
