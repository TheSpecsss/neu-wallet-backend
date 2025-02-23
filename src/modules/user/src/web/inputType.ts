import { objectType } from "nexus";

const login = objectType({
	name: "Login",
	definition(t) {
		t.string("token");
	},
});

const userBalance = objectType({
	name: "UserBalance",
	definition(t) {
		t.float("balance");
	},
});

export default [login, userBalance];
