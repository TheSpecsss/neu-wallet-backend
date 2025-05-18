export function addFilterCondition<TFilter, TWhereInput extends { OR?: unknown[] }>(
	whereClause: TWhereInput,
	filter: TFilter,
	filterKey: keyof TFilter,
	conditions: unknown[],
): void {
	if (filter[filterKey]) {
		whereClause.OR = [...(whereClause.OR || []), ...conditions];
	}
}
