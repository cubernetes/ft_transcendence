import { FastifyInstance } from "fastify";
import type GameService from "../services/game.service";

const gameRoutes = async (
  fastify: FastifyInstance,
  options: { gameService: GameService }
) => {
  fastify.get("/all", async (_, reply) => {
    try {
      const allGames = await options.gameService.findAll();
      return reply.send(allGames);
    } catch (error) {
      fastify.log.error("Database query error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });

  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const game = await options.gameService.findById(+id); // TODO: Where to handle wrong format

      if (!game) return reply.status(404).send({ error: "Game not found" });
      return reply.send(game);
    } catch (error) {
      fastify.log.error("Database query error:", error);
      return reply.status(500).send({ error: "Internal server error" });
    }
  });
};

export default gameRoutes;
