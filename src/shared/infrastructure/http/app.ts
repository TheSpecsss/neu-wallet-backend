import { schema } from "@/shared/infrastructure/http/graphql/schema";
import { type Context, authorize } from "@/shared/infrastructure/http/helpers/authorize";
import { ApolloServer } from "@apollo/server";
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import fastifyCors from "@fastify/cors";
import Fastify from "fastify";

(async () => {
	const fastify = Fastify({ logger: true });

	const apollo = new ApolloServer<Context>({
		schema,
		plugins: [fastifyApolloDrainPlugin(fastify)],
	});

	await apollo.start();

	await fastify.register(fastifyApollo(apollo), {
		context: authorize,
	});

	await fastify.register(fastifyCors, { origin: "*", methods: ["POST"] });

	fastify.listen({ port: Number(process.env.PORT) || 8080 }, (error) => {
		if (error) throw error;
	});
})();
