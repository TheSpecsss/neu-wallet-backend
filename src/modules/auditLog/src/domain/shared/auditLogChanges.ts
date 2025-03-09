export interface IAuditLogChangeValue {
	from: string;
	to: string;
}

export interface IAuditLogChange {
	key: string;
	values: IAuditLogChangeValue[];
}
