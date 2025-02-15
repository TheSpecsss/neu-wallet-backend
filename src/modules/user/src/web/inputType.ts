import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { enumType } from "nexus";

const userAccountType = enumType({
	name: "UserAccountType",
	members: USER_ACCOUNT_TYPE,
});

export default [userAccountType];
