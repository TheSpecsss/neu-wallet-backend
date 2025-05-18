import { ORDER_BY_VALUES } from "@/shared/constant";
import { enumType } from "nexus";

export const Utils = [
	enumType({
		name: "OrderBy",
		members: ORDER_BY_VALUES,
	}),
];
