import { schema } from "@/shared/infrastructure/http/graphql/schema";
import { type Context, authorize } from "@/shared/infrastructure/http/helpers/authorize";
import { ApolloServer } from "@apollo/server";
import { fastifyApolloDrainPlugin, fastifyApolloHandler } from "@as-integrations/fastify";
import fastifyCors from "@fastify/cors";
import fastify from "fastify";

(async () => {
	const app = fastify({ logger: true });

	const apollo = new ApolloServer<Context>({
		schema,
		introspection: true,
		plugins: [fastifyApolloDrainPlugin(app)],
	});

	await apollo.start();

	await app.register(async (instance) => {
		instance.all(
			"/graphql",
			fastifyApolloHandler(apollo, {
				context: authorize,
			}),
		);
	});

	await app.register(fastifyCors, { origin: "*", methods: ["POST"] });

	app.listen({ port: Number(process.env.PORT) || 8080 }, (error) => {
		if (error) throw error;
	});
})();
