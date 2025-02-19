import { objectType } from "nexus";

const login = objectType({
	name: "Login",
	definition(t) {
		t.string("token");
	},
});

export default [login];
