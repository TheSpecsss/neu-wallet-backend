import { Identifier } from "@/shared/domain/identifier";
import { Snowflake } from "nodejs-snowflake";

export class SnowflakeID extends Identifier<string> {
	constructor(id?: string) {
		super(
			id
				? id
				: new Snowflake({
						custom_epoch: 1735660800000,
					})
						.getUniqueID()
						.toString(),
		);
	}
}
