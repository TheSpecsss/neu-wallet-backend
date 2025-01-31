import { Identifier } from "@/shared/domain/identifier";
import { snowflakeConfig } from "config/snowflake";
import { Snowflake } from "nodejs-snowflake";

export class SnowflakeID extends Identifier<string> {
	constructor(id?: string) {
		super(id ? id : new Snowflake(snowflakeConfig).getUniqueID().toString());
	}
}
