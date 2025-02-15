import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { enumType, objectType } from "nexus";

const userAccountType = enumType({
	name: "UserAccountType",
	members: USER_ACCOUNT_TYPE,
});

const login = objectType({
	name: "Login",
	definition(t) {
		t.string("token");
	},
});

export default [userAccountType, login];
